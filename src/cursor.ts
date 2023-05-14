import Vim from './vim'

const WHITE_SPACE = /[\n\s]/
const WORD_CHARS = /[^\n\s]/
const STRICT_WORD_CHARS = /[a-zA-Z0-9_]/

export const nextWord = (text: string, pos: number, strict = true) => {
    if (pos === text.length - 1) return pos
    const originalPos = pos
    // end of current word
    while (
        pos < text.length - 1 &&
        ((strict && STRICT_WORD_CHARS.test(text[pos])) || (!strict && WORD_CHARS.test(text[pos])))
    ) {
        pos++
    }
    // next non whitespace char
    while (pos < text.length - 1 && WHITE_SPACE.test(text[pos])) {
        // special case
        if (text[pos] === '\n' && text[pos + 1] === '\n') return pos + 1
        pos++
    }
    // next word
    return WHITE_SPACE.test(text[pos]) ? originalPos : pos
}

export const nextEndOfWord = (text: string, pos: number, strict = true) => {
    if (pos === text.length - 1) return pos
    pos++
    // next non whitespace char
    while (pos < text.length - 1 && WHITE_SPACE.test(text[pos])) {
        pos++
    }
    // next word
    while (
        pos < text.length - 1 &&
        ((strict && STRICT_WORD_CHARS.test(text[pos])) || (!strict && WORD_CHARS.test(text[pos])))
    ) {
        pos++
    }
    // end of word
    return WHITE_SPACE.test(text[pos]) ? pos - 1 : pos
}

export const prevStartOfWord = (text: string, pos: number, strict = true) => {
    if (pos === 0) return 0
    pos--
    // next non whitespace char
    while (pos > 0 && WHITE_SPACE.test(text[pos])) {
        // special case
        if (text[pos] === '\n' && text[pos - 1] === '\n') return pos
        pos--
    }
    // start of previous word
    while (pos > 0 && ((strict && STRICT_WORD_CHARS.test(text[pos])) || (!strict && WORD_CHARS.test(text[pos])))) {
        pos--
    }
    // end of word
    return WHITE_SPACE.test(text[pos]) ? pos + 1 : pos
}

export const getRowCol = (text: string, pos: number) => {
    let row = 0
    let col = 0
    for (let i = 0; i < pos; i++) {
        if (text[i] === '\n') {
            row++
            col = 0
        } else {
            col++
        }
    }
    return { row, col }
}

class Cursor {
    vim: Vim
    pos: number = 0
    row: number = 0
    col: number = 0
    colInput: number = 0 // last column moved to by h or l

    constructor(vim: Vim) {
        this.vim = vim
    }

    moveRight() {
        if (this.pos === this.vim.text.length - 1) return
        if (this.vim.text[this.pos] === '\n' || this.vim.text[this.pos + 1] === '\n') {
            return
        }
        this.pos++
        this.col++
        this.colInput = this.col
        this.vim.textarea.setSelectionRange(this.pos, this.pos)
    }

    moveLeft() {
        if (this.pos === 0) return
        if (this.vim.text[this.pos - 1] === '\n') return
        this.pos--
        this.col--
        this.colInput = this.col
        this.vim.textarea.setSelectionRange(this.pos, this.pos)
    }

    moveDown() {
        const lines = this.vim.text.split('\n')
        if (this.row < lines.length - 1) {
            const prevCol = this.col
            const prevRow = this.row
            this.row++
            this.col = Math.min(this.colInput, Math.max(0, lines[this.row].length - 1))
            this.pos += this.col + lines[prevRow].length - prevCol + 1
            this.vim.textarea.setSelectionRange(this.pos, this.pos)
        }
    }

    moveUp() {
        const lines = this.vim.text.split('\n')
        if (this.row > 0) {
            const prevCol = this.col
            this.row--
            this.col = Math.min(this.colInput, Math.max(0, lines[this.row].length - 1))
            this.pos -= prevCol + (lines[this.row].length - this.col) + 1
            this.vim.textarea.setSelectionRange(this.pos, this.pos)
        }
    }

    moveNextWord(strict = true) {
        this.pos = nextWord(this.vim.text, this.pos, strict)
        const { row, col } = getRowCol(this.vim.text, this.pos)
        this.row = row
        this.col = col
        this.colInput = this.col
        this.vim.textarea.setSelectionRange(this.pos, this.pos)
    }

    moveNextEndOfWord(strict = true) {
        this.pos = nextEndOfWord(this.vim.text, this.pos, strict)
        const { row, col } = getRowCol(this.vim.text, this.pos)
        this.row = row
        this.col = col
        this.colInput = this.col
        this.vim.textarea.setSelectionRange(this.pos, this.pos)
    }

    movePrevStartOfWord(strict = true) {
        this.pos = prevStartOfWord(this.vim.text, this.pos, strict)
        const { row, col } = getRowCol(this.vim.text, this.pos)
        this.row = row
        this.col = col
        this.colInput = this.col
        this.vim.textarea.setSelectionRange(this.pos, this.pos)
    }

    moveToStartOfLine() {
        this.pos -= this.col
        this.col = 0
        this.colInput = this.col
        this.vim.textarea.setSelectionRange(this.pos, this.pos)
    }

    moveToEndOfLine() {
        const lines = this.vim.text.split('\n')
        this.pos += lines[this.row].length - this.col
        this.col = lines[this.row].length
        this.colInput = this.col
        this.vim.textarea.setSelectionRange(this.pos, this.pos)
    }

    moveToFirstNonBlank() {
        const lines = this.vim.text.split('\n')
        let i = 0
        while (i < lines[this.row].length && WHITE_SPACE.test(lines[this.row][i])) {
            i++
        }
        this.pos += i - this.col
        this.col = i
        this.colInput = this.col
        this.vim.textarea.setSelectionRange(this.pos, this.pos)
    }

    moveToLine(num: number) {
        const lines = this.vim.text.split('\n')
        if (num === -1) num = lines.length - 1
        this.row = num
        this.pos = 0
        for (let i = 0; i < num; i++) {
            this.pos += lines[i].length + 1
        }
        this.col = 0
        this.colInput = this.col
        this.moveToFirstNonBlank()
    }
}

export default Cursor
