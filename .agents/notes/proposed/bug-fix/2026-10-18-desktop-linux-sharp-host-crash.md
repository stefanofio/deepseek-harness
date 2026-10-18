# Agent Note: Reproduce and plan the Desktop Host crash on Linux image attachment

Status: proposed

English | [中文](2026-10-18-desktop-linux-sharp-host-crash.zh.md)

## Problem

Sending a message with an image from the Desktop application on Linux terminates the application with the fatal recovery dialog *"The application could not start or stopped unexpectedly."* The same session, attached in the Web application, completes. The crash report names neither sharp nor the crashing library, so the report reads as a generic Host exit:

```
Error: dsh desktop host stopped: Debugger listening on ws://127.0.0.1:9230/…
For help, see: https://nodejs.org/learn/getting-started/debugging
(node:73959) [SharpElectronLinux] Warning: Binaries provided by Electron for use on Linux may be incompatible with sharp - see https://sharp.pixelplumbing.com/install#electron-and-linux
(Use `electron --trace-warnings ...` to show where the warning was created)
    at ChildProcess.<anonymous> (file:///…/apps/desktop/lib/main.js:3845:36)
```

The `[SharpElectronLinux]` warning is emitted by the sharp loader for every Electron process on Linux, including a healthy one, so it does not identify the failure. The second screenshot of the same session shows the window after the Host stopped: a "Reconnecting…" indicator and a composer whose title-bar model shows "DeepSeek-V4.1 Flash High" while the footer still shows "DeepSeek-V4.1 Flash Off". That inconsistency is a separate symptom of the dead Host, not the cause.

### Reproduction

The crash reproduces without the window, through the same code path the Desktop Host uses. Under the Electron executable in RunAsNode mode (`ELECTRON_RUN_AS_NODE=1`), a single sharp pipeline that creates a 64x48 image, encodes it to PNG, and reads its header back aborts the process:

```sh
cd apps/desktop
ELECTRON_RUN_AS_NODE=1 ./node_modules/electron/dist/electron -e '
  require("sharp")({ create: { width: 64, height: 48, channels: 3, background: { r: 10, g: 20, b: 30 } } })
    .png().toBuffer().then((b) => require("sharp")(b).metadata()).then(console.log)'
```

The same script under system Node 22.23.1 prints the metadata and exits 0. Under Electron 44.7.0, the debugger reports the failing thread directly:

```
Thread "libuv-worker" received signal SIGSEGV, Segmentation fault.
#0  0x0000000000000000 in ?? ()
#1  0x00007ffff79b656c in g_object_unref () from /lib64/libgobject-2.0.so.0
#2  0x00007fff6deed4b3 in ?? () from …/@img/sharp-linux-x64@0.35.5/…/sharp-linux-x64-0.35.5.node
#3  0x00007fff6def7432 in ?? () from …/@img/sharp-linux-x64@0.35.5/…/sharp-linux-x64-0.35.5.node
#4  0x00007fff6deece94 in ?? () from …/@img/sharp-linux-x64@0.35.5/…/sharp-linux-x64-0.35.5.node
#5  node::ThreadPoolWork::ScheduleWork()::{lambda(uv_work_s*)#1}::__invoke(uv_work_s*)
```

### Cause

`apps/desktop-host/src/index.ts` runs the Desktop Host, Web server, and every profile plugin inside the Electron executable started with `ELECTRON_RUN_AS_NODE=1`. On Linux, that executable links against the system GLib family (`libglib-2.0`, `libgobject-2.0`, `libgio-2.0`, `libgmodule-2.0`) for its GUI, and those symbols remain in the process. Sharp's native addon loads its bundled libvips, which exports the same GLib symbols. The dynamic linker binds the addon's calls to the system `libgobject` already present in the process, while the addon's thread pool runs on a libuv worker thread. Decoding then aborts inside `g_object_unref` on a reference that the system library did not create. Sharp documents this as a known Electron-on-Linux interaction and points to [electron#46323](https://github.com/electron/electron/issues/46323):

> Binaries provided by Electron for use on Linux dynamically link against a globally-installed `glib` and leak its symbols into the process space, which may cause… `GLib-GObject: g_object_unref: assertion 'G_IS_OBJECT (object)' failed`.

Attachment admission calls sharp for every submitted image: `detectImage()` and `probeImage()` in `packages/attachment/attachment-local/src/image.ts` obtain it through `requireSharp()` in `packages/attachment/attachment-local/src/sharp.ts`, a lazy `createRequire` of the `sharp` package. Because attachment admission runs in the Host, the crash is reachable from the first image of any Desktop session on Linux; the Web application, served by a plain Node process, is unaffected.

The report's `dsh desktop host stopped` line is produced by `apps/desktop/src/host-process.ts` from the child's `close` event and stderr tail. The addon writes nothing to stderr before the frame that crashes, so the shell cannot distinguish this crash from an ordinary nonzero exit.

## Proposal

Stop loading sharp's Linux addon into a process that has already loaded Electron's GUI libraries. Three directions are viable; they are listed in the order this note recommends.

### Option A: Run image decoding in a separate Node process on Linux Desktop

Keep the Host on Electron (the [Electron RunAsNode runtime](../../archived/architecture/2026-09-11-desktop-electron-node-runtime.md) stays intact) and move only native-image work behind a process seam. The Desktop primary runtime already ships an upstream Node binary at `runtime/primary-runtime/dependencies/node/bin/node` for Office authoring, so no new runtime download is required.

- The attachment provider selects between two implementations: an in-process sharp caller (default, and the only one on macOS and Windows) and a subprocess caller (Linux Desktop with Electron).
- The subprocess speaks a small, versioned protocol — image bytes in, `DetectedImage` metadata or `AttachmentError` out — so `detectImage()`, `probeImage()`, and normalization share one seam rather than each opening a process.
- The choice is an explicit, validated `Config` field on the attachment provider (for example `imageWorker: 'in-process' | 'subprocess'`), set by the Desktop Host overlay, not a `process.versions.electron` check buried in `run()`. This follows the no-hardcoded-tunables rule and the explicit request/spec split convention.
- Lifecycle: the worker is a child of the Host, is terminated with the Host, and a worker death fails the attachment operation with a typed error instead of exiting the application.

This is the only option that removes the crash class rather than one image at a time, and it also hardens the Host against any other native addon that shares symbols with Electron's GUI stack.

### Option B: Render images with the Chromium rasterizer in the renderer

The renderer already displays attached images, and Chromium decodes every supported format without libvips. A renderer-side preflight could downscale to the normalization budget and re-encode to PNG/WebP with `createImageBitmap` and `OffscreenCanvas`, so the Host only receives bytes it accepts without sharp decoding the source. This avoids a subprocess but loses libvips' metadata inspection (EXIF orientation, embedded profiles, depth) and makes admission limits depend on browser behavior, which weakens the deterministic normalization guarantees of `dsh-attachment-local`. It also does not protect paths that read stored attachments outside a submit, such as historical reads.

### Option C: Report the crash instead of fixing it

Add a Host-side `process.on('uncaughtException')`/`'exit'` diagnostic that names sharp when the failure happens during image decoding, and make the recovery dialog say that image attachments crash on Linux. This is a strictly worse option than A for users and still loses the message, but it is cheap and can ship before A if a release is imminent.

## Alternatives considered

- **Set `LD_LIBRARY_PATH` to the bundled libvips directory.** Verified ineffective: `@img/sharp-libvips-linux-x64@1.3.4` in this installation ships only `libvips-cpp.so.8.18.7` and `glib-2.0` data, no GLib shared objects, so no clean GLib is available to prefer at runtime. The failure is symbol interposition inside the process, not a library search-path issue.
- **Rebuild sharp against Electron's headers.** Sharp's prebuilt addon is built against upstream Node's ABI; rebuilding would tie Desktop's native dependency to every Electron upgrade and still bind GLib to the system library already loaded, so it would not address the cause.
- **Run the whole Host on upstream Node instead of Electron.** This would remove the Electron GLib link but reverses the deliberate [Desktop runtime decision](../../archived/architecture/2026-09-11-desktop-electron-node-runtime.md) and would reintroduce a second runtime for the Host, pnpm, and package scripts.
- **Start the Host with a pruned environment that unloads GLib.** Shared libraries cannot be unloaded once the loader has mapped them; no environment variable changes that for an already-linked executable.
- **Keep using the Web application for images.** Works today but is a product workaround that leaves the Desktop Linux path broken.

## Acceptance criteria

- On Linux Desktop, submitting an image, submitting a message with a stored image, and normalizing that image all complete without terminating the Host; the same flow keeps working in the Web application and on macOS and Windows.
- A focused regression starts the Electron executable in RunAsNode mode, exercises the same decode path the Host uses, and fails on the unhandled SIGSEGV; a keyless recorded session pins the Desktop attachment flow once the seam exists.
- The attachment provider's image-worker choice is a validated configuration field, documented in its README, and the Host overlay sets it for Linux.
- Worker failure surfaces as a typed attachment error in the conversation, not a fatal recovery dialog.

## Risks

Option A adds a process boundary in the admission path: bytes cross it, latency and failure modes change, and packaging must carry the worker entry next to the Host. Until it lands, Linux Desktop users lose image attachment support on the first crash; the current default keeps that state. The Desktop Linux targets are still experimental (`778864be89`), which is why this note records the reproduction rather than changing the Host today.
