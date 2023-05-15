import { next_blank, w, W, e, E, b, B, ge, gE, h, l, k, j, motion } from '../src/motion'

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

describe('w', () => {
    test('two words', () => {
        expect(w('abc def', 0)).toBe(4)
        expect(w('abc  \ndef', 0)).toBe(6)
        expect(w('abc\t\n\tdef', 0)).toBe(6)
        expect(w('abc\t\n\tdef_a', 0)).toBe(6)
        expect(w('?def', 0)).toBe(1)
    })
    test('word then non-blank', () => {
        expect(w('abc )ef', 0)).toBe(4)
        expect(w('abc )(ef', 0)).toBe(4)
        expect(w('.?', 0)).toBe(1)
    })
    test('no next word', () => {
        expect(w('abc', 0)).toBe(2)
        expect(w('?.', 1)).toBe(1)
    })
    test('consecutive newlines', () => {
        expect(w('abc\n\ndef', 0)).toBe(4)
        expect(w('.%\n\ndef', 1)).toBe(3)
    })
    test('blank then word', () => {
        expect(w(' ab', 0)).toBe(1)
    })
})

describe('W', () => {
    test('two WORDs', () => {
        expect(W('a.c d?f', 0)).toBe(4)
        expect(W('(.c  \nd()a', 0)).toBe(6)
        expect(W('a^c\t\n\td$(', 0)).toBe(6)
        expect(W('abc\t\n\tdef_a', 0)).toBe(6)
        expect(W('?\tdef', 0)).toBe(2)
    })
    test('no next WORD', () => {
        expect(W('abc', 0)).toBe(2)
        expect(W('?.', 0)).toBe(1)
    })
    test('consecutive neWlines', () => {
        expect(W('..#\n\nd&f', 0)).toBe(4)
    })
    test('blank then WORD', () => {
        expect(W('  .b', 0)).toBe(2)
    })
})

describe('e', () => {
    test('single word', () => {
        expect(e('abc', 0)).toBe(2)
    })
    test('two words', () => {
        expect(e('abc def', 0)).toBe(2)
        expect(e('abc def', 2)).toBe(6)
        expect(e('abc def', 1)).toBe(2)
        expect(e('()', 0)).toBe(1)
    })
    test('test end of text', () => {
        expect(e('abc', 2)).toBe(2)
        expect(e('a?', 1)).toBe(1)
        expect(e('abc ', 2)).toBe(3)
        expect(e('abc  ', 2)).toBe(4)
    })
    test('consecutive newlines', () => {
        expect(e('a\n\nb', 0)).toBe(3)
    })
})

describe('E', () => {
    test('single WORD', () => {
        expect(E('abc', 0)).toBe(2)
    })
    test('two WORDs', () => {
        expect(E('a.? d(f', 0)).toBe(2)
        expect(E('/?? (ef', 2)).toBe(6)
        expect(E('_@c 2@@', 1)).toBe(2)
        expect(E('abc()', 0)).toBe(4)
    })
    test('test end of text', () => {
        expect(E('abc', 2)).toBe(2)
        expect(E('??', 1)).toBe(1)
        expect(e('?.# ', 2)).toBe(3)
        expect(e('?#1  ', 2)).toBe(4)
    })
    test('consecutive newlines', () => {
        expect(E(',\n\n??b', 0)).toBe(5)
    })
})

describe('b', () => {
    test('one word', () => {
        expect(b('abc', 2)).toBe(0)
        expect(b('abc', 1)).toBe(0)
        expect(b('abc', 0)).toBe(0)
    })
    test('two word', () => {
        expect(b('abc def', 3)).toBe(0)
        expect(b('abc def', 4)).toBe(0)
        expect(b(' abc def', 5)).toBe(1)
        expect(b('abc.', 3)).toBe(0)
    })
    test('consecutive newlines', () => {
        expect(b('a\n\nb', 3)).toBe(2)
        expect(b('a\n\nb', 1)).toBe(0)
        expect(b('a\n\nb', 2)).toBe(0)
    })
    test('start of text', () => {
        expect(b('abc', 0)).toBe(0)
        expect(b('  abc', 2)).toBe(0)
    })
})

describe('B', () => {
    test('one WORD', () => {
        expect(B('.bc', 2)).toBe(0)
        expect(B('.$#', 1)).toBe(0)
        expect(B('@!!', 0)).toBe(0)
    })
    test('two WORD', () => {
        expect(B('#?1 234', 3)).toBe(0)
        expect(B('34. .?*', 4)).toBe(0)
        expect(B('\t>>< ()a', 5)).toBe(1)
    })
    test('consecutive newlines', () => {
        expect(B('.\n\n?', 3)).toBe(2)
        expect(B('?\n\n#', 1)).toBe(0)
        expect(B('@\n\n2', 2)).toBe(0)
    })
    test('start of text', () => {
        expect(B('...', 0)).toBe(0)
        expect(B('  ..?', 2)).toBe(0)
    })
})

describe('ge', () => {
    test('one word', () => {
        expect(ge('abc', 2)).toBe(0)
    })
    test('two words', () => {
        expect(ge('abc  def', 3)).toBe(2)
        expect(ge('abc def', 4)).toBe(2)
        expect(ge('abc def', 5)).toBe(2)
    })
    test('consecutive newlines', () => {
        expect(ge('a\n\nb', 3)).toBe(0)
    })
})

describe('gE', () => {
    test('one WORD', () => {
        expect(gE('a.?', 2)).toBe(0)
    })
    test('two WORDs', () => {
        expect(gE('a.@ \t12#', 3)).toBe(2)
        expect(gE('... 1.2', 4)).toBe(2)
        expect(gE('@3@ f..', 5)).toBe(2)
    })
    test('consecutive newlines', () => {
        expect(ge('.\n\n?', 3)).toBe(0)
    })
})

describe('h', () => {
    test('basic', () => {
        expect(h('abc', 1)).toBe(0)
        expect(h('abc', 2)).toBe(1)
    })
    test('start of text', () => {
        expect(h('abc', 0)).toBe(0)
    })
    test('previous is newline', () => {
        expect(h('\nabc', 1)).toBe(1)
    })
})

describe('l', () => {
    test('basic', () => {
        expect(l('abc', 1)).toBe(2)
        expect(l('abc', 0)).toBe(1)
    })
    test('end of text', () => {
        expect(l('abc', 2)).toBe(2)
    })
    test('next is newline', () => {
        expect(l('abc\n', 2)).toBe(2)
    })
})

describe('k', () => {
    test('basic', () => {
        expect(k('abc\ndef', 4)).toBe(0)
        expect(k('abc\ndef', 5)).toBe(1)
        expect(k('\nabc\ndef', 5)).toBe(1)
        expect(k('abc\nd\ne', 6, 2)).toBe(4)
        expect(k('abc\nd\ne', 4, 2)).toBe(2)
    })
    test('initial col greater', () => {
        expect(k('a\ndef', 4)).toBe(0)
        expect(k('\na\ndef', 5)).toBe(1)
    })
    test('initial col less', () => {
        expect(k('abc\nd', 4, 2)).toBe(2)
        expect(k('\nabc\nd', 5, 2)).toBe(3)
    })
    test('blank line', () => {
        expect(k('abc\n\n', 4)).toBe(0)
    })
    test('one line', () => {
        expect(k('abc', 2)).toBe(2)
        expect(k('abc\ndef', 2)).toBe(2)
    })
})

describe('j', () => {
    test('basic', () => {
        expect(j('abc\ndef', 0)).toBe(4)
        expect(j('abc\ndef\n', 1)).toBe(5)
        expect(j('abc\nd\ne', 0, 2)).toBe(4)
        expect(j('abc\nd\nef', 4, 2)).toBe(7)
    })
    test('initial col greater', () => {
        expect(j('abc\nd', 2)).toBe(4)
        expect(j('\nabc\nde', 3)).toBe(6)
    })
    test('initial col less', () => {
        expect(j('a\nbcd', 0, 2)).toBe(4)
        expect(j('\na\nbcd', 1, 2)).toBe(5)
    })
    test('blank line', () => {
        expect(j('\n\nabc', 1)).toBe(2)
    })
    test('one line', () => {
        expect(j('abc', 2)).toBe(2)
        expect(j('abc\ndef', 4)).toBe(4)
    })
})
describe('motion', () => {
    test('single motion', () => {
        expect(motion({ type: 'w' }, 'abc def', 0)).toBe(4)
        expect(motion({ type: 'W' }, 'abc def', 0)).toBe(4)
    })
    test('multiple motions', () => {
        expect(motion({ type: 'e', count: 2 }, 'abc def', 0)).toBe(6)
    })
    test('k multiple motions', () => {
        expect(motion({ type: 'k', count: 2 }, 'abc\nd\ne', 6, 2)).toBe(2)
        expect(motion({ type: 'k', count: 3 }, 'abc\nd\ne', 6, 2)).toBe(2)
        expect(motion({ type: 'k', count: 2 }, 'abc\nd\ne', 6, 1)).toBe(1)
        expect(motion({ type: 'k', count: 2 }, 'abc\nd\ne', 6, 1)).toBe(1)
        expect(motion({ type: 'k', count: 2 }, 'abc\nd\ne', 6, 5)).toBe(2)
    })
    test('j multiple motions', () => {
        expect(motion({ type: 'j', count: 2 }, 'abc\nd\ne', 2)).toBe(6)
        expect(motion({ type: 'j', count: 4 }, 'abc\nd\ne', 2)).toBe(6)
        expect(motion({ type: 'j', count: 2 }, 'abc\nd\nefg', 2)).toBe(8)
    })
})
