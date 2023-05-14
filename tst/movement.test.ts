import {
    next_blank,
    next_word,
    next_WORD,
    next_end_of_word,
    next_end_of_WORD,
    prev_word,
    prev_WORD,
    prev_end_of_word,
    prev_end_of_WORD,
} from '../src/movement'

describe('next_blank', () => {
    test('word followed by blanks', () => {
        expect(next_blank('abc  ', 0)).toBe(3)
        expect(next_blank('abc \n', 0)).toBe(3)
        expect(next_blank('abc \n ', 0)).toBe(3)
        expect(next_blank('abc \n\n ', 0)).toBe(3)
        expect(next_blank('abc \t  abc', 0)).toBe(3)
    })
    test("don't match consecutive newlines", () => {
        expect(next_blank('abc \n\n ', 0)).toBe(3)
        expect(next_blank('abc \n\n', 0)).toBe(3)
        expect(next_blank('abc \n \n', 0)).toBe(3)
    })
    test('no match', () => {
        expect(next_blank('abc', 0)).toBe(-1)
    })
    test('empty string', () => {
        expect(next_blank('', 0)).toBe(-1)
    })
})

describe('next_word', () => {
    test('two words', () => {
        expect(next_word('abc def', 0)).toBe(4)
        expect(next_word('abc  \ndef', 0)).toBe(6)
        expect(next_word('abc\t\n\tdef', 0)).toBe(6)
        expect(next_word('abc\t\n\tdef_a', 0)).toBe(6)
        expect(next_word('?def', 0)).toBe(1)
    })
    test('word then non-blank', () => {
        expect(next_word('abc )ef', 0)).toBe(4)
        expect(next_word('abc )(ef', 0)).toBe(4)
        expect(next_word('.?', 0)).toBe(1)
    })
    test('no next word', () => {
        expect(next_word('abc', 0)).toBe(-1)
        expect(next_word('?.', 1)).toBe(-1)
    })
    test('consecutive newlines', () => {
        expect(next_word('abc\n\ndef', 0)).toBe(4)
        expect(next_word('.%\n\ndef', 1)).toBe(3)
    })
    test('blank then word', () => {
        expect(next_word(' ab', 0)).toBe(1)
    })
})

describe('next_WORD', () => {
    test('two WORDs', () => {
        expect(next_WORD('a.c d?f', 0)).toBe(4)
        expect(next_WORD('(.c  \nd()a', 0)).toBe(6)
        expect(next_WORD('a^c\t\n\td$(', 0)).toBe(6)
        expect(next_WORD('abc\t\n\tdef_a', 0)).toBe(6)
        expect(next_WORD('?\tdef', 0)).toBe(2)
    })
    test('no next WORD', () => {
        expect(next_WORD('abc', 0)).toBe(-1)
        expect(next_WORD('?.', 0)).toBe(-1)
    })
    test('consecutive newlines', () => {
        expect(next_WORD('..#\n\nd&f', 0)).toBe(4)
    })
    test('blank then WORD', () => {
        expect(next_WORD('  .b', 0)).toBe(2)
    })
})

describe('next_end_of_word', () => {
    test('single word', () => {
        expect(next_end_of_word('abc', 0)).toBe(2)
    })
    test('two words', () => {
        expect(next_end_of_word('abc def', 0)).toBe(2)
        expect(next_end_of_word('abc def', 2)).toBe(6)
        expect(next_end_of_word('abc def', 1)).toBe(2)
        expect(next_end_of_word('()', 0)).toBe(1)
    })
    test('test end of text', () => {
        expect(next_end_of_word('abc', 2)).toBe(2)
        expect(next_end_of_word('a?', 1)).toBe(1)
        expect(next_end_of_word('abc', 1)).toBe(2)
    })
    test('consecutive newlines', () => {
        expect(next_end_of_word('a\n\nb', 0)).toBe(3)
    })
})

describe('next_end_of_WORD', () => {
    test('single WORD', () => {
        expect(next_end_of_WORD('abc', 0)).toBe(2)
    })
    test('two WORDs', () => {
        expect(next_end_of_WORD('a.? d(f', 0)).toBe(2)
        expect(next_end_of_WORD('/?? (ef', 2)).toBe(6)
        expect(next_end_of_WORD('_@c 2@@', 1)).toBe(2)
        expect(next_end_of_WORD('abc()', 0)).toBe(4)
    })
    test('test end of text', () => {
        expect(next_end_of_WORD('abc', 2)).toBe(2)
        expect(next_end_of_WORD('??', 1)).toBe(1)
    })
    test('consecutive newlines', () => {
        expect(next_end_of_WORD(',\n\n??b', 0)).toBe(5)
    })
})

describe('prev_word', () => {
    test('one word', () => {
        expect(prev_word('abc', 2)).toBe(0)
        expect(prev_word('abc', 1)).toBe(0)
        expect(prev_word('abc', 0)).toBe(-1)
    })
    test('two word', () => {
        expect(prev_word('abc def', 3)).toBe(0)
        expect(prev_word('abc def', 4)).toBe(0)
        expect(prev_word(' abc def', 5)).toBe(1)
        expect(prev_word('abc.', 3)).toBe(0)
    })
    test('consecutive newlines', () => {
        expect(prev_word('a\n\nb', 3)).toBe(2)
        expect(prev_word('a\n\nb', 1)).toBe(0)
        expect(prev_word('a\n\nb', 2)).toBe(0)
    })
})

describe('prev_WORD', () => {
    test('one WORD', () => {
        expect(prev_WORD('.bc', 2)).toBe(0)
        expect(prev_WORD('.$#', 1)).toBe(0)
        expect(prev_WORD('@!!', 0)).toBe(-1)
    })
    test('two WORD', () => {
        expect(prev_WORD('#?1 234', 3)).toBe(0)
        expect(prev_WORD('34. .?*', 4)).toBe(0)
        expect(prev_WORD('\t>>< ()a', 5)).toBe(1)
    })
    test('consecutive newlines', () => {
        expect(prev_WORD('.\n\n?', 3)).toBe(2)
        expect(prev_WORD('?\n\n#', 1)).toBe(0)
        expect(prev_WORD('@\n\n2', 2)).toBe(0)
    })
})

describe('prev_end_of_word', () => {
    test('one word', () => {
        expect(prev_end_of_word('abc', 2)).toBe(-1)
    })
    test('two words', () => {
        expect(prev_end_of_word('abc  def', 3)).toBe(2)
        expect(prev_end_of_word('abc def', 4)).toBe(2)
        expect(prev_end_of_word('abc def', 5)).toBe(2)
    })
    test('consecutive newlines', () => {
        expect(prev_end_of_word('a\n\nb', 3)).toBe(0)
    })
})

describe('prev_end_of_WORD', () => {
    test('one WORD', () => {
        expect(prev_end_of_WORD('a.?', 2)).toBe(-1)
    })
    test('two WORDs', () => {
        expect(prev_end_of_WORD('a.@ \t12#', 3)).toBe(2)
        expect(prev_end_of_WORD('... 1.2', 4)).toBe(2)
        expect(prev_end_of_WORD('@3@ f..', 5)).toBe(2)
    })
})
