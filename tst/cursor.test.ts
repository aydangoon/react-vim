import { nextWord, nextEndOfWord, prevStartOfWord } from '../src/cursor'

describe('nextWord', () => {
    test('test 1 space separating words', () => {
        const text = 'This is a sample sentence.'
        const pos = 0
        expect(nextWord(text, pos)).toBe(5)
    })
    test('test multiple spaces separating words', () => {
        const text = 'test   this'
        const pos = 0
        expect(nextWord(text, pos)).toBe(7)
    })
    test('test starting on space', () => {
        const text = 'test   this'
        const pos = 5
        expect(nextWord(text, pos)).toBe(7)
    })
    test('test consecutive newlines', () => {
        const text = 'a\n\nb'
        const pos = 0
        expect(nextWord(text, pos)).toBe(2)
    })
    test('test newlines with multiple spaces between', () => {
        const text = 'a\n   \nb'
        const pos = 0
        expect(nextWord(text, pos)).toBe(6)
    })
    test('not strict', () => {
        const text = 'a.b'
        const pos = 0
        expect(nextWord(text, pos)).toBe(1)
    })
    test('strict', () => {
        const text = 'a b'
        const pos = 0
        expect(nextWord(text, pos)).toBe(2)
    })
})

describe('nextEndofWord', () => {
    test('test 1 space separating words', () => {
        const text = 'This is'
        const pos = 0
        expect(nextEndOfWord(text, pos)).toBe(3)
    })
    test('test starting on end goes to end of next word', () => {
        const text = 'This is'
        const pos = 3
        expect(nextEndOfWord(text, pos)).toBe(6)
    })
    test('middle of word', () => {
        const text = 'This is'
        const pos = 1
        expect(nextEndOfWord(text, pos)).toBe(3)
    })
    test('skip over large number of consecutive whitespace', () => {
        const text = 'a \n\n is'
        const pos = 0
        expect(nextEndOfWord(text, pos)).toBe(6)
    })
    test('strict', () => {
        const text = 'a.b'
        const pos = 0
        expect(nextEndOfWord(text, pos)).toBe(1)
    })
    test('not strict', () => {
        const text = 'a.b'
        const pos = 0
        expect(nextEndOfWord(text, pos, false)).toBe(2)
    })
})

describe('prevStartOfWord', () => {
    test('test 1 space separating words', () => {
        const text = 'This is'
        const pos = 3
        expect(prevStartOfWord(text, pos)).toBe(0)
    })
    test('test starting on whitespace', () => {
        const text = 'This  is'
        const pos = 5
        expect(prevStartOfWord(text, pos)).toBe(0)
    })
    test('strict', () => {
        const text = 'a.b'
        const pos = 2
        expect(prevStartOfWord(text, pos)).toBe(1)
    })
    test('not strict', () => {
        const text = 'a.b'
        const pos = 2
        expect(prevStartOfWord(text, pos, false)).toBe(0)
    })
    test('two adjacent newlines special case', () => {
        const text = 'a\n\nb'
        const pos = 3
        expect(prevStartOfWord(text, pos)).toBe(2)
    })
})
