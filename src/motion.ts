/**
 * Functions for motions on text.
 * @module
 */
// match (alpanumber and _) sequence, single non-blank character, or empty line
const RGX_word = /\w+|[^\w\s]|(?<=\n)\n/

// match (alpanumber and _) sequence, or single non-blank character
const RGX_word_NO_EMPTY_LINE = /\w+|[^\w\s]/

// match non-blank sequence, or empty line
const RGX_WORD = /\S+|(?<=\n)\n/

// match non-blank sequence
const RGX_WORD_NO_EMPTY_LINE = /\S+/

// match non-blank character
const RGX_WORD_CHAR = /\S/

// match blank sequence, excluding two consecutive newlines
const RGX_blank = /([ \t]|(?:\n(?!\n)))+/

export const MOTION_TYPES = [
    'w',
    'W',
    'e',
    'E',
    'b',
    'B',
    'ge',
    'gE',
    'h',
    'l',
    'k',
    'j',
    '0',
    '^',
    '$',
    'g_',
] as const

export type MotionType = (typeof MOTION_TYPES)[number]

export interface Motion {
    count?: number
    type: MotionType
    options?: $Options // TODO: union more options as needed
}

export const RGX_motion = /w|W|e|E|b|B|(g(e|E|_)?)|h|l|k|j|0|\^|\$/

export const get_column = (text: string, pos: number): number =>
    text[pos] === '\n' ? 0 : pos - (text.lastIndexOf('\n', pos - 1) + 1)

export const get_row = (text: string, pos: number): number => {
    const row = text.slice(0, pos).split('\n').length - 1
    return row < 0 ? 0 : row
}

/**
 *  returns the absolute position of the start of the row of the given position
 */
export const row_start = (text: string, pos: number, include_newline: boolean): number => {
    return pos <= 0 ? 0 : text.lastIndexOf('\n', pos - 1) + Number(!include_newline)
}

// get the absolute position of the start of the nth row
export const row_n_start = (text: string, n: number): number => {
    let i = 0
    while (n > 0 && i < text.length) {
        if (text[i] === '\n') {
            n--
        }
        i++
    }
    return i
}

export const in_last_row = (text: string, pos: number): boolean => {
    return text.indexOf('\n', pos) === -1
}

export const row_end = (text: string, pos: number, include_newline: boolean): number => {
    const next_newline = text.indexOf('\n', pos)
    return next_newline === -1 ? text.length - 1 : next_newline - Number(!include_newline)
}

export const next_blank = (text: string, pos: number): number => {
    if (pos === text.length - 1) return -1
    const match = RGX_blank.exec(text.slice(pos))
    if (!match) return -1
    return pos + match.index
}

export const w = (text: string, pos: number): number => {
    if (pos === text.length - 1) return pos
    const initial_word = RGX_word.exec(text.slice(pos))
    if (!initial_word) return text.length - 1
    if (next_blank(text, pos) === pos) return pos + initial_word.index
    const offset = initial_word[0].length
    const next_word = RGX_word.exec(text.slice(pos + offset))
    return next_word ? pos + offset + next_word.index : text.length - 1
}

export const W = (text: string, pos: number): number => {
    if (pos === text.length - 1) return pos
    const initial_WORD = RGX_WORD.exec(text.slice(pos))
    if (!initial_WORD) return pos
    if (next_blank(text, pos) === pos) return pos + initial_WORD.index
    const offset = initial_WORD[0].length
    const next_WORD = RGX_WORD.exec(text.slice(pos + offset))
    return next_WORD ? pos + offset + next_WORD.index : text.length - 1
}

export const e = (text: string, pos: number): number => {
    if (pos === text.length - 1) return text.length - 1
    const word = RGX_word_NO_EMPTY_LINE.exec(text.slice(pos + 1))
    return word ? pos + word.index + word[0].length : text.length - 1
}

export const E = (text: string, pos: number): number => {
    if (pos === text.length - 1) return text.length - 1
    const WORD = RGX_WORD_NO_EMPTY_LINE.exec(text.slice(pos + 1))
    return WORD ? pos + WORD.index + WORD[0].length : text.length - 1
}

export const b = (text: string, pos: number): number => {
    if (pos === 0) return pos
    const flipped = text.slice(0, pos).split('').reverse().join('')
    const b_flipped = RGX_word.exec(flipped)
    if (!b_flipped) return 0
    const { index, 0: word } = b_flipped
    return pos - index - word.length + Number(word === '\n') // bc flipped, empty line needs +1
}

export const B = (text: string, pos: number): number => {
    if (pos === 0) return pos
    const flipped = text.slice(0, pos).split('').reverse().join('')
    const B_flipped = RGX_WORD.exec(flipped)
    if (!B_flipped) return 0
    const { index, 0: WORD } = B_flipped
    return pos - index - WORD.length + Number(WORD === '\n') // bc flipped, empty line needs +1
}

export const ge = (text: string, pos: number): number => {
    if (pos === 0) return pos
    const flipped = text
        .slice(0, pos + 1)
        .replace(/\n/g, ' ') // treat newlines as spaces
        .split('')
        .reverse()
        .join('')
    const next_word_flipped = w(flipped, 0)
    return pos - next_word_flipped
}

export const gE = (text: string, pos: number): number => {
    if (pos === 0) return pos
    const flipped = text
        .slice(0, pos + 1)
        .replace(/\n/g, ' ') // treat newlines as spaces
        .split('')
        .reverse()
        .join('')
    const next_WORD_flipped = W(flipped, 0)
    return pos - next_WORD_flipped
}

export const h = (text: string, pos: number): number => {
    return pos === 0 || text[pos - 1] === '\n' ? pos : pos - 1
}
export const l = (text: string, pos: number): number => {
    return pos === text.length - 1 || text[pos + 1] === '\n' ? pos : pos + 1
}

export const k = (text: string, pos: number, desired_col?: number): number => {
    const line_start = text.lastIndexOf('\n', pos - 1) + 1
    const prev_line_start = text.lastIndexOf('\n', line_start - 2) + 1
    if (line_start === prev_line_start) return pos
    const col = desired_col ?? pos - line_start
    const prev_line_len = line_start - prev_line_start - 2
    return prev_line_start + (col < prev_line_len ? col : prev_line_len)
}

export const j = (text: string, pos: number, desired_col?: number): number => {
    const line_start = text.lastIndexOf('\n', pos - 1) + 1
    const next_line_start = text.indexOf('\n', pos) + 1
    if (next_line_start === 0 || next_line_start === text.length) return pos
    const col = desired_col ?? pos - line_start
    let next_line_end = text.indexOf('\n', next_line_start)
    next_line_end = next_line_end === -1 ? text.length : next_line_end
    return next_line_start === next_line_end
        ? next_line_end
        : Math.min(next_line_start + col, next_line_end - 1)
}

export const zero = (text: string, pos: number) => text.lastIndexOf('\n', pos - 1) + 1

export const caret = (text: string, pos: number) => {
    const line_start = zero(text, pos)
    let line_end = text.indexOf('\n', pos) - 1 // exclude newline
    line_end = line_end < 0 ? text.length - 1 : line_end
    if (line_end < line_start) return pos
    const word = RGX_word.exec(text.substring(line_start, line_end + 1))
    return word ? line_start + word.index : line_end
}

interface $Options {
    count?: number
    in_visual_mode?: boolean
}
export const $ = (text: string, pos: number, options: $Options = {}) => {
    const count = options.count ?? 0
    // move count - 1 lines down
    for (let i = 0; i < count - 1; i++) {
        const next_line_start = text.indexOf('\n', pos) + 1
        if (next_line_start === 0) break
        pos = next_line_start
    }
    const next_newline = text.indexOf('\n', pos)
    const is_empty = pos === next_newline
    return next_newline === -1
        ? text.length - 1
        : next_newline - Number(!options.in_visual_mode && !is_empty)
}

export const g_ = (text: string, pos: number, count: number = 1) => {
    // move count - 1 lines down
    for (let i = 0; i < count - 1; i++) {
        const next_line_start = text.indexOf('\n', pos) + 1
        if (next_line_start === 0) break
        pos = next_line_start
    }
    // empty line
    if (text[pos] === '\n') return pos
    // find index of last non-blank or start of line if none
    const line_start = text.lastIndexOf('\n', pos) + 1
    let last_nonblank = line_start
    for (let i = line_start; i < text.length; i++) {
        if (RGX_WORD_CHAR.test(text[i])) last_nonblank = i
        if (text[i] === '\n') break
    }
    return last_nonblank
}

export const move = (m: Motion, text: string, pos: number, desired_col?: number): number => {
    const count = m.count || 1
    const type = m.type
    const col = desired_col ?? get_column(text, pos)
    for (let i = 0; i < count; i++) {
        const prev_pos = pos
        pos = (() => {
            // prettier-ignore
            switch (type) {
                case 'w':  return w(text, pos)
                case 'W':  return W(text, pos)
                case 'e':  return e(text, pos)
                case 'E':  return E(text, pos)
                case 'b':  return b(text, pos)
                case 'B':  return B(text, pos)
                case 'ge': return ge(text, pos)
                case 'gE': return gE(text, pos)
                case 'h':  return h(text, pos)
                case 'l':  return l(text, pos)
                case 'k':  return k(text, pos, col)
                case 'j':  return j(text, pos, col)
                case '0':  return zero(text, pos)
                case '^':  return caret(text, pos)
                case '$':  return $(text, pos, { count, in_visual_mode: m.options?.in_visual_mode})
                case 'g_': return g_(text, pos, count)
                default:   return pos
            }
        })()
        // stop for motions that don't repeat <count> times or
        // if next position is the same as the previous
        if (type === '$' || type === 'g_' || prev_pos === pos) break
    }
    return pos
}

export const is_exclusive = (t: MotionType) => {
    // prettier-ignore
    switch (t) {
        case 'w': case 'W': case 'h': case 'l':
        case '0': case '^': case 'k': case 'j':
        case 'w': case 'W': case 'b': case 'B':
            return true
        default: 
            return false
    }
}

export const is_linewise = (t: MotionType) => {
    // prettier-ignore
    switch (t) {
        case 'k': case 'j': 
            return true
        default:
            return false
    }
}
