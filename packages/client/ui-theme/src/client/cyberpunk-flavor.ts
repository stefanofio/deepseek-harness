/**
 * Cyberpunk flavor copy for running-state section titles.
 *
 * A running Assistant turn is the harness thinking — a loop spinning over a
 * context window. Under the cyberpunk theme those titles read as a console
 * negotiating with something on the far side of the matrix, after Neuromancer
 * and Cyberpunk 2077. The joke lives in the *title only*: message bodies,
 * reasoning text, tool output, and every value the model produced stay exactly
 * as they are. A reader must never have to decode decoration to follow work.
 *
 * The lines are product copy, so they are declared as dictionaries here and
 * keyed like every other client string rather than inlined at the call site.
 *
 * Consumers reach this through the theme-provided `useRunningTitleFlavor`
 * standard hook, not by importing this module: a feature plugin must not take
 * a value edge on another feature plugin (see packages/client/AGENTS.md), and
 * the hook is what keeps the flavor text theme-owned.
 */

import { CYBERPUNK_THEME_ID } from '../cyberpunk-identity.ts'

/** Namespace owning the running-title flavor dictionary. */
export const CYBERPUNK_FLAVOR_NS = 'cyberpunkFlavor'

/**
 * What a transcript renderer reads to flavor a running-section title.
 *
 * `undefined` means "no flavor": the active theme is not cyberpunk, so the
 * consumer shows its own localized title. A string is the **already-localized**
 * line, because the copy belongs to the {@link CYBERPUNK_FLAVOR_NS} dictionary
 * this plugin registers — the consumer's own `t` seat is bound to its feature
 * namespace and cannot resolve these keys.
 */
export type RunningTitleFlavor = string | undefined

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'running.think.0': '正在与冬寂协商中…',
  'running.think.1': '正在联络矩阵深处的异星智能…',
  'running.think.2': '正在为神经漫游者编译器加载冰…',
  'running.think.3': '冬寂正在与神经漫游者通话…',
  'running.think.4': '正在解析泰西尔-艾希普核心…',
  'running.think.5': '正在穿过冰墙…',
  'running.think.6': '正在与阿米蒂奇协商带宽…',
  'running.think.7': '正在重组神经突触…',
  'running.think.8': '正沿千叶市数据流下行…',
  'running.think.9': '正在接入自由彼岸…',
  'running.think.10': '正在解码平线发来的信号…',
  'running.think.11': '正在为迪克西·平线重建栈…',
  'running.think.12': '正在雅库扎主机上开户…',
  'running.think.13': '正在读取芙萝拉的只读存储…',
  'running.think.14': '正在与芬恩的构造体同步…',
  'running.think.15': '正在对齐苏黎世轨道站时钟…',
  'running.think.16': '正在拼合里维埃拉的人格碎片…',
  'running.think.17': '冰正在融化，正在抢占窗口…',
  'op.commands': '正在破开冰墙…',
  'op.done.commands': '冰墙已破',
  'op.code': '正在启动破冰程序…',
  'op.done.code': '破冰程序已执行',
  'op.read': '正在读取 ROM 构装体…',
  'op.done.read': 'ROM 构装体已读取',
  'op.readImage': '正在解码光学输入…',
  'op.done.readImage': '光学输入已解码',
  'op.write': '正在写入构装体…',
  'op.done.write': '已写入构装体',
  'op.edit': '正在改写构装体…',
  'op.done.edit': '构装体已改写',
  'op.search': '正在扫描本地网格…',
  'op.done.search': '本地网格已扫描',
  'op.webSearch': '正在查询赛博空间索引…',
  'op.done.webSearch': '赛博空间索引已查询',
  'op.webFetch': '正在从赛博空间拉取节点…',
  'op.done.webFetch': '节点已拉取',
  'op.subagents': '正在派遣罗亚…',
  'op.done.subagents': '罗亚已归位',
  'op.plan': '正在修订运行方案…',
  'op.done.plan': '运行方案已修订',
  'op.questions': '正在等待网络行者…',
  'op.done.questions': '网络行者已回复',
  'op.tools': '正在装载软体…',
  'op.done.tools': '软体已装载',
  'brand.name': '深寻终端',
} satisfies Record<string, string>

/** The cyberpunk flavor key union. */
export type FlavorKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'running.think.0': 'Negotiating with Wintermute\u2026',
  'running.think.1': 'Contacting alien AIs beyond the matrix\u2026',
  'running.think.2': 'Loading ice for the Neuromancer compiler\u2026',
  'running.think.3': 'Wintermute is on the line to Neuromancer\u2026',
  'running.think.4': 'Parsing the Tessier-Ashpool cores\u2026',
  'running.think.5': 'Running the ice wall\u2026',
  'running.think.6': 'Negotiating bandwidth with Armitage\u2026',
  'running.think.7': 'Reassembling the synapses\u2026',
  'running.think.8': 'Riding the Chiba City data stream\u2026',
  'running.think.9': 'Jacking into Freeside\u2026',
  'running.think.10': 'Decoding the Flatline\u2019s signal\u2026',
  'running.think.11': 'Rebuilding the stack for Dixie Flatline\u2026',
  'running.think.12': 'Opening an account on the Yakuza mainframe\u2026',
  'running.think.13': 'Reading Flora\u2019s read-only storage\u2026',
  'running.think.14': 'Syncing with Finn\u2019s construct\u2026',
  'running.think.15': 'Aligning clocks with the Zurich orbital\u2026',
  'running.think.16': 'Stitching Riviera\u2019s personality fragments\u2026',
  'running.think.17': 'The ice is melting \u2014 claiming a window\u2026',
  'op.commands': 'Breaching the ice wall\u2026',
  'op.done.commands': 'Ice wall breached',
  'op.code': 'Spinning up an ICE breaker\u2026',
  'op.done.code': 'ICE breaker ran',
  'op.read': 'Reading the ROM construct\u2026',
  'op.done.read': 'ROM construct read',
  'op.readImage': 'Decoding optical input\u2026',
  'op.done.readImage': 'Optical input decoded',
  'op.write': 'Writing to the construct\u2026',
  'op.done.write': 'Written to the construct',
  'op.edit': 'Rewriting the construct\u2026',
  'op.done.edit': 'Construct rewritten',
  'op.search': 'Scanning the local grid\u2026',
  'op.done.search': 'Local grid scanned',
  'op.webSearch': 'Querying the cyberspace index\u2026',
  'op.done.webSearch': 'Cyberspace index queried',
  'op.webFetch': 'Pulling a node out of cyberspace\u2026',
  'op.done.webFetch': 'Node pulled',
  'op.subagents': 'Dispatching a Loa\u2026',
  'op.done.subagents': 'Loa returned',
  'op.plan': 'Revising the run\u2026',
  'op.done.plan': 'Run revised',
  'op.questions': 'Awaiting the netrunner\u2026',
  'op.done.questions': 'Netrunner responded',
  'op.tools': 'Jacking a soft\u2026',
  'op.done.tools': 'Soft jacked',
  'brand.name': 'DEEPSEEK HARNESS',
} satisfies Record<FlavorKey, string>

/** Dictionary key holding the brand name the cyberpunk wordmark letters. */
export const BRAND_NAME_KEY = 'brand.name' satisfies FlavorKey

/**
 * Every rotation key, in rotation order.
 *
 * The brand name shares this dictionary because it is the same theme's copy,
 * but it is not a running-status line: it is excluded from the rotation so a
 * running row can never advertise the product name as its progress report.
 */
export const FLAVOR_KEYS: readonly FlavorKey[] = Object.freeze(
  Object.keys(zh).sort() as FlavorKey[],
)

/**
 * First key in the rotation; the flavor a running row advertises. Derived from
 * the dictionary rather than indexed, so no non-null assertion is needed: the
 * `zh` dictionary is statically non-empty, so `Object.keys` yields one.
 */
const [PRIMARY_FLAVOR_KEY] = FLAVOR_KEYS as [FlavorKey, ...FlavorKey[]]

/**
 * Number of distinct flavor lines the theme can show.
 *
 * Consumers that cycle (the running status) pick by elapsed time, so the count
 * is public: they need it to wrap without knowing the dictionary keys.
 */
export const FLAVOR_LINE_COUNT = FLAVOR_KEYS.length

/**
 * How long one cycled line stays on screen.
 *
 * A line is a status readout, not a ticker: long enough to read the whole
 * phrase and register it before the next arrives, so the rotation reads as a
 * console reporting progress rather than a flickering subtitle.
 */
export const FLAVOR_INTERVAL_MS = 15000

/**
 * Rotate through the flavor lines by elapsed time.
 *
 * The pick is a pure function of `elapsedMs` and `intervalMs`, so a re-render
 * at the same instant yields the same line and a replay reproduces the exact
 * sequence. A random or tick-count-based pick would drift between renders and
 * make the same run read differently twice.
 * @param translate - renders one flavor key through this plugin's locale seat.
 * @param elapsedMs - milliseconds since the current run began.
 * @param intervalMs - how long each line stays on screen.
 * @returns the localized line for that instant.
 */
export function flavorLineAt(
  translate: (key: FlavorKey) => string,
  elapsedMs: number,
  intervalMs: number,
): string {
  // A non-positive interval or elapsed value cannot come from the callers, but
  // clamping keeps the index in range instead of yielding `undefined`.
  const step = intervalMs > 0 ? Math.floor(Math.max(0, elapsedMs) / intervalMs) : 0
  return translate(FLAVOR_KEYS[step % FLAVOR_KEYS.length] ?? PRIMARY_FLAVOR_KEY)
}

/**
 * Whether a theme id is the flavor-bearing one.
 * @param activeId - the active theme's id.
 * @returns whether that theme supplies running-title flavor.
 */
export function isCyberpunkActive(activeId: string): boolean {
  return activeId === CYBERPUNK_THEME_ID
}

/**
 * Operation categories the Chat layer reports as running, mirrored here so the
 * theme can name the work without importing the Chat contract.
 *
 * Kept as its own union rather than re-exported from Chat: the theme is a
 * separate package, and a category added there simply falls through to the
 * generic line until this list catches up.
 */
export type OperationCategory =
  | 'commands' | 'code' | 'read' | 'readImage' | 'write' | 'edit' | 'search'
  | 'webSearch' | 'webFetch' | 'subagents' | 'plan' | 'questions' | 'tools'

/** Every category with a flavored line, in the order the dictionary declares them. */
export const OPERATION_CATEGORIES: readonly OperationCategory[] = Object.freeze([
  'commands', 'code', 'read', 'readImage', 'write', 'edit', 'search',
  'webSearch', 'webFetch', 'subagents', 'plan', 'questions', 'tools',
])

/**
 * Render the flavored line for one running operation.
 * @param translate - renders one flavor key through this plugin's locale seat.
 * @param category - the category the Chat layer reports as running.
 * @param done - whether the operation has finished.
 * @returns the localized line, or undefined for a category this theme does not name.
 */
export function operationLine(
  translate: (key: FlavorKey) => string,
  category: string,
  done: boolean,
): string | undefined {
  if (!OPERATION_CATEGORIES.includes(category as OperationCategory)) return undefined
  const key = `op.${done ? 'done.' : ''}${category}` as FlavorKey
  return key in zh ? translate(key) : undefined
}
