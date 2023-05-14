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
    let offset = pos
    const current_word = VIM_word.exec(text.slice(offset))
    offset += current_word ? current_word[0].length : 0
    const next_word = VIM_word.exec(text.slice(offset))
    return next_word ? offset + next_word.index : -1
}

export const next_WORD = (text: string, pos: number): number => {
    if (pos >= text.length - 1) return -1
    let offset = pos
    const current_WORD = VIM_WORD.exec(text.slice(offset))
    offset += current_WORD ? current_WORD[0].length : 0
    const next_WORD = VIM_WORD.exec(text.slice(offset))
    return next_WORD ? offset + next_WORD.index : -1
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
