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

export const next_word = (text: string, pos: number): number => {
    if (pos >= text.length - 1) return -1
    const initial_word = VIM_word.exec(text.slice(pos))
    if (!initial_word) return -1
    if (next_blank(text, pos) === pos) return pos + initial_word.index
    const offset = initial_word[0].length
    const next_word = VIM_word.exec(text.slice(pos + offset))
    return next_word ? pos + offset + next_word.index : -1
}

export const next_WORD = (text: string, pos: number): number => {
    if (pos >= text.length - 1) return -1
    const initial_WORD = VIM_WORD.exec(text.slice(pos))
    if (!initial_WORD) return -1
    if (next_blank(text, pos) === pos) return pos + initial_WORD.index
    const offset = initial_WORD[0].length
    const next_WORD = VIM_WORD.exec(text.slice(pos + offset))
    return next_WORD ? pos + offset + next_WORD.index : -1
}

export const next_end_of_word = (text: string, pos: number): number => {
    if (pos >= text.length - 1) return text.length - 1
    const word = VIM_word_NO_EMPTY_LINE.exec(text.slice(pos + 1))
    return word ? pos + 1 + word.index + word[0].length - 1 : -1
}

export const next_end_of_WORD = (text: string, pos: number): number => {
    if (pos >= text.length - 1) return text.length - 1
    const WORD = VIM_WORD_NO_EMPTY_LINE.exec(text.slice(pos + 1))
    return WORD ? pos + 1 + WORD.index + WORD[0].length - 1 : -1
}

export const prev_word = (text: string, pos: number): number => {
    if (pos <= 0) return -1
    const flipped = text.slice(0, pos).split('').reverse().join('')
    const prev_word_flipped = VIM_word.exec(flipped)
    if (!prev_word_flipped) return -1
    const { index, 0: word } = prev_word_flipped
    return pos - index - word.length + (word === '\n' ? 1 : 0) // bc flipped, empty line needs +1
}

export const prev_WORD = (text: string, pos: number): number => {
    if (pos <= 0) return -1
    const flipped = text.slice(0, pos).split('').reverse().join('')
    const prev_WORD_flipped = VIM_WORD.exec(flipped)
    if (!prev_WORD_flipped) return -1
    const { index, 0: WORD } = prev_WORD_flipped
    return pos - index - WORD.length + (WORD === '\n' ? 1 : 0) // bc flipped, empty line needs +1
}

export const prev_end_of_word = (text: string, pos: number): number => {
    if (pos <= 0) return -1
    const flipped = text
        .slice(0, pos + 1)
        .replace(/\n/g, ' ') // treat newlines as spaces
        .split('')
        .reverse()
        .join('')
    const next_word_flipped = next_word(flipped, 0)
    return next_word_flipped !== -1 ? pos - next_word_flipped : -1
}

export const prev_end_of_WORD = (text: string, pos: number): number => {
    if (pos <= 0) return -1
    const flipped = text
        .slice(0, pos + 1)
        .replace(/\n/g, ' ') // treat newlines as spaces
        .split('')
        .reverse()
        .join('')
    const next_WORD_flipped = next_WORD(flipped, 0)
    return next_WORD_flipped !== -1 ? pos - next_WORD_flipped : -1
}
