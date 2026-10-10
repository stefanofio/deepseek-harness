"""Resolve conflict markers by keeping HEAD, THEIRS, or BOTH."""
import sys

def resolve(path, mode):
    lines = open(path).read().split('\n')
    out, i, n = [], 0, 0
    while i < len(lines):
        if lines[i].startswith('<<<<<<<'):
            j = i + 1
            while not lines[j].startswith('======='): j += 1
            k = j + 1
            while not lines[k].startswith('>>>>>>>'): k += 1
            head, theirs = lines[i+1:j], lines[j+1:k]
            if mode == 'head': out.extend(head)
            elif mode == 'theirs': out.extend(theirs)
            else:
                out.extend(head)
                if head and theirs and head[-1].strip() and theirs[0].strip():
                    pass
                out.extend(theirs)
            n += 1
            i = k + 1
        else:
            out.append(lines[i]); i += 1
    open(path, 'w').write('\n'.join(out))
    print(f'{path}: resolved {n} conflict(s) as {mode}')

if __name__ == '__main__':
    resolve(sys.argv[1], sys.argv[2])
