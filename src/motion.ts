// match (alpanumber and _) sequence, single non-blank character, or empty line
const VIM_word = /\w+|[^\w\s]|(?<=\n)\n/

// match (alpanumber and _) sequence, or single non-blank character
const VIM_word_NO_EMPTY_LINE = /\w+|[^\w\s]/

// match non-blank sequence, or empty line
const VIM_WORD = /\S+|(?<=\n)\n/

// match non-blank sequence
const VIM_WORD_NO_EMPTY_LINE = /\S+/

// match blank sequence, excluding two consecutive newlines
const VIM_blank = /([ \t]|(?:\n(?!\n)))+/

export const next_blank = (text: string, pos: number): number => {
    if (pos >= text.length - 1) return -1
    const match = VIM_blank.exec(text.slice(pos))
    if (!match) return -1
    return pos + match.index
}

export const w = (text: string, pos: number): number => {
    if (pos >= text.length - 1) return pos
    const initial_word = VIM_word.exec(text.slice(pos))
    if (!initial_word) return text.length - 1
    if (next_blank(text, pos) === pos) return pos + initial_word.index
    const offset = initial_word[0].length
    const next_word = VIM_word.exec(text.slice(pos + offset))
    return next_word ? pos + offset + next_word.index : text.length - 1
}

export const W = (text: string, pos: number): number => {
    if (pos >= text.length - 1) return pos
    const initial_WORD = VIM_WORD.exec(text.slice(pos))
    if (!initial_WORD) return pos
    if (next_blank(text, pos) === pos) return pos + initial_WORD.index
    const offset = initial_WORD[0].length
    const next_WORD = VIM_WORD.exec(text.slice(pos + offset))
    return next_WORD ? pos + offset + next_WORD.index : text.length - 1
}

export const e = (text: string, pos: number): number => {
    if (pos >= text.length - 1) return text.length - 1
    const word = VIM_word_NO_EMPTY_LINE.exec(text.slice(pos + 1))
    return word ? pos + word.index + word[0].length : text.length - 1
}

export const E = (text: string, pos: number): number => {
    if (pos >= text.length - 1) return text.length - 1
    const WORD = VIM_WORD_NO_EMPTY_LINE.exec(text.slice(pos + 1))
    return WORD ? pos + WORD.index + WORD[0].length : text.length - 1
}

export const b = (text: string, pos: number): number => {
    if (pos <= 0) return pos
    const flipped = text.slice(0, pos).split('').reverse().join('')
    const b_flipped = VIM_word.exec(flipped)
    if (!b_flipped) return 0
    const { index, 0: word } = b_flipped
    return pos - index - word.length + (word === '\n' ? 1 : 0) // bc flipped, empty line needs +1
}

export const B = (text: string, pos: number): number => {
    if (pos <= 0) return pos
    const flipped = text.slice(0, pos).split('').reverse().join('')
    const B_flipped = VIM_WORD.exec(flipped)
    if (!B_flipped) return 0
    const { index, 0: WORD } = B_flipped
    return pos - index - WORD.length + (WORD === '\n' ? 1 : 0) // bc flipped, empty line needs +1
}

export const ge = (text: string, pos: number): number => {
    if (pos <= 0) return pos
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
    if (pos <= 0) return pos
    const flipped = text
        .slice(0, pos + 1)
        .replace(/\n/g, ' ') // treat newlines as spaces
        .split('')
        .reverse()
        .join('')
    const next_WORD_flipped = W(flipped, 0)
    return pos - next_WORD_flipped
}

export type MotionType = 'w' | 'W' | 'e' | 'E' | 'b' | 'B' | 'ge' | 'gE'
export interface Motion {
    count?: number
    type: MotionType
}

export const motion = (m: Motion, text: string, pos: number): number => {
    let new_pos = pos
    const count = m.count || 1
    const type = m.type
    for (let i = 0; i < count; i++) {
        if (type === 'w') new_pos = w(text, new_pos)
        else if (type === 'W') new_pos = W(text, new_pos)
        else if (type === 'e') new_pos = e(text, new_pos)
        else if (type === 'E') new_pos = E(text, new_pos)
        else if (type === 'b') new_pos = b(text, new_pos)
        else if (type === 'B') new_pos = B(text, new_pos)
        else if (type === 'ge') new_pos = ge(text, new_pos)
        else if (type === 'gE') new_pos = gE(text, new_pos)
        if (new_pos === pos) return pos
    }
    return new_pos
}
