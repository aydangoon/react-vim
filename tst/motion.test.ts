import * as motion from '../src/motion'

describe('motion.get_column', () => {
    test('basic', () => {
        expect(motion.get_column('abc', 0)).toBe(0)
        expect(motion.get_column('abc\nd', 4)).toBe(0)
        expect(motion.get_column('abc\ndef', 6)).toBe(2)
    })
    test('empty line', () => {
        expect(motion.get_column('\n', 0)).toBe(0)
        expect(motion.get_column('\n\n', 1)).toBe(0)
    })
})
describe('motion.get_row', () => {
    test('basic', () => {
        expect(motion.get_row('abc', 0)).toBe(0)
        expect(motion.get_row('abc\nd', 4)).toBe(1)
        expect(motion.get_row('abc\ndef', 6)).toBe(1)
    })
    test('empty line', () => {
        expect(motion.get_row('\n', 0)).toBe(0)
        expect(motion.get_row('\n\n', 1)).toBe(1)
    })
})

describe('motion.row_n_start', () => {
    test('basic', () => {
        expect(motion.row_n_start('abc', 0)).toBe(0)
        expect(motion.row_n_start('abc\nd', 1)).toBe(4)
        expect(motion.row_n_start('abc\ndef', 1)).toBe(4)
    })
    test('empty line', () => {
        expect(motion.row_n_start('\n', 0)).toBe(0)
        expect(motion.row_n_start('\n\n', 1)).toBe(1)
    })
})

describe('motion.next_blank', () => {
    test('word followed by blanks', () => {
        expect(motion.next_blank('abc  ', 0)).toBe(3)
        expect(motion.next_blank('abc \n', 0)).toBe(3)
        expect(motion.next_blank('abc \n ', 0)).toBe(3)
        expect(motion.next_blank('abc \n\n ', 0)).toBe(3)
        expect(motion.next_blank('abc \t  abc', 0)).toBe(3)
    })
    test("don't match consecutive newlines", () => {
        expect(motion.next_blank('abc \n\n ', 0)).toBe(3)
        expect(motion.next_blank('abc \n\n', 0)).toBe(3)
        expect(motion.next_blank('abc \n \n', 0)).toBe(3)
    })
    test('no match', () => {
        expect(motion.next_blank('abc', 0)).toBe(-1)
    })
    test('empty string', () => {
        expect(motion.next_blank('', 0)).toBe(-1)
    })
})

describe('w', () => {
    test('two words', () => {
        expect(motion.w('abc def', 0)).toBe(4)
        expect(motion.w('abc  \ndef', 0)).toBe(6)
        expect(motion.w('abc\t\n\tdef', 0)).toBe(6)
        expect(motion.w('abc\t\n\tdef_a', 0)).toBe(6)
        expect(motion.w('?def', 0)).toBe(1)
    })
    test('word then non-blank', () => {
        expect(motion.w('abc )ef', 0)).toBe(4)
        expect(motion.w('abc )(ef', 0)).toBe(4)
        expect(motion.w('.?', 0)).toBe(1)
    })
    test('no next word', () => {
        expect(motion.w('abc', 0)).toBe(2)
        expect(motion.w('?.', 1)).toBe(1)
    })
    test('consecutive newlines', () => {
        expect(motion.w('abc\n\ndef', 0)).toBe(4)
        expect(motion.w('.%\n\ndef', 1)).toBe(3)
    })
    test('blank then word', () => {
        expect(motion.w(' ab', 0)).toBe(1)
    })
})

describe('W', () => {
    test('two WORDs', () => {
        expect(motion.W('a.c d?f', 0)).toBe(4)
        expect(motion.W('(.c  \nd()a', 0)).toBe(6)
        expect(motion.W('a^c\t\n\td$(', 0)).toBe(6)
        expect(motion.W('abc\t\n\tdef_a', 0)).toBe(6)
        expect(motion.W('?\tdef', 0)).toBe(2)
    })
    test('no next WORD', () => {
        expect(motion.W('abc', 0)).toBe(2)
        expect(motion.W('?.', 0)).toBe(1)
    })
    test('consecutive neWlines', () => {
        expect(motion.W('..#\n\nd&f', 0)).toBe(4)
    })
    test('blank then WORD', () => {
        expect(motion.W('  .b', 0)).toBe(2)
    })
})

describe('e', () => {
    test('single word', () => {
        expect(motion.e('abc', 0)).toBe(2)
    })
    test('two words', () => {
        expect(motion.e('abc def', 0)).toBe(2)
        expect(motion.e('abc def', 2)).toBe(6)
        expect(motion.e('abc def', 1)).toBe(2)
        expect(motion.e('()', 0)).toBe(1)
    })
    test('test end of text', () => {
        expect(motion.e('abc', 2)).toBe(2)
        expect(motion.e('a?', 1)).toBe(1)
        expect(motion.e('abc ', 2)).toBe(3)
        expect(motion.e('abc  ', 2)).toBe(4)
    })
    test('consecutive newlines', () => {
        expect(motion.e('a\n\nb', 0)).toBe(3)
    })
})

describe('E', () => {
    test('single WORD', () => {
        expect(motion.E('abc', 0)).toBe(2)
    })
    test('two WORDs', () => {
        expect(motion.E('a.? d(f', 0)).toBe(2)
        expect(motion.E('/?? (ef', 2)).toBe(6)
        expect(motion.E('_@c 2@@', 1)).toBe(2)
        expect(motion.E('abc()', 0)).toBe(4)
    })
    test('test end of text', () => {
        expect(motion.E('abc', 2)).toBe(2)
        expect(motion.E('??', 1)).toBe(1)
        expect(motion.E('?.# ', 2)).toBe(3)
        expect(motion.E('?#1  ', 2)).toBe(4)
    })
    test('consecutive newlines', () => {
        expect(motion.E(',\n\n??b', 0)).toBe(5)
    })
})

describe('b', () => {
    test('one word', () => {
        expect(motion.b('abc', 2)).toBe(0)
        expect(motion.b('abc', 1)).toBe(0)
        expect(motion.b('abc', 0)).toBe(0)
    })
    test('two word', () => {
        expect(motion.b('abc def', 3)).toBe(0)
        expect(motion.b('abc def', 4)).toBe(0)
        expect(motion.b(' abc def', 5)).toBe(1)
        expect(motion.b('abc.', 3)).toBe(0)
    })
    test('consecutive newlines', () => {
        expect(motion.b('a\n\nb', 3)).toBe(2)
        expect(motion.b('a\n\nb', 1)).toBe(0)
        expect(motion.b('a\n\nb', 2)).toBe(0)
    })
    test('start of text', () => {
        expect(motion.b('abc', 0)).toBe(0)
        expect(motion.b('  abc', 2)).toBe(0)
    })
})

describe('B', () => {
    test('one WORD', () => {
        expect(motion.B('.bc', 2)).toBe(0)
        expect(motion.B('.$#', 1)).toBe(0)
        expect(motion.B('@!!', 0)).toBe(0)
    })
    test('two WORD', () => {
        expect(motion.B('#?1 234', 3)).toBe(0)
        expect(motion.B('34. .?*', 4)).toBe(0)
        expect(motion.B('\t>>< ()a', 5)).toBe(1)
    })
    test('consecutive newlines', () => {
        expect(motion.B('.\n\n?', 3)).toBe(2)
        expect(motion.B('?\n\n#', 1)).toBe(0)
        expect(motion.B('@\n\n2', 2)).toBe(0)
    })
    test('start of text', () => {
        expect(motion.B('...', 0)).toBe(0)
        expect(motion.B('  ..?', 2)).toBe(0)
    })
})

describe('ge', () => {
    test('one word', () => {
        expect(motion.ge('abc', 2)).toBe(0)
    })
    test('two words', () => {
        expect(motion.ge('abc  def', 3)).toBe(2)
        expect(motion.ge('abc def', 4)).toBe(2)
        expect(motion.ge('abc def', 5)).toBe(2)
    })
    test('consecutive newlines', () => {
        expect(motion.ge('a\n\nb', 3)).toBe(0)
    })
})

describe('gE', () => {
    test('one WORD', () => {
        expect(motion.gE('a.?', 2)).toBe(0)
    })
    test('two WORDs', () => {
        expect(motion.gE('a.@ \t12#', 3)).toBe(2)
        expect(motion.gE('... 1.2', 4)).toBe(2)
        expect(motion.gE('@3@ f..', 5)).toBe(2)
    })
    test('consecutive newlines', () => {
        expect(motion.gE('.\n\n?', 3)).toBe(0)
    })
})

describe('h', () => {
    test('basic', () => {
        expect(motion.h('abc', 1)).toBe(0)
        expect(motion.h('abc', 2)).toBe(1)
    })
    test('start of text', () => {
        expect(motion.h('abc', 0)).toBe(0)
    })
    test('previous is newline', () => {
        expect(motion.h('\nabc', 1)).toBe(1)
    })
})

describe('l', () => {
    test('basic', () => {
        expect(motion.l('abc', 1)).toBe(2)
        expect(motion.l('abc', 0)).toBe(1)
    })
    test('end of text', () => {
        expect(motion.l('abc', 2)).toBe(2)
    })
    test('next is newline', () => {
        expect(motion.l('abc\n', 2)).toBe(2)
    })
})

describe('k', () => {
    test('basic', () => {
        expect(motion.k('abc\ndef', 4)).toBe(0)
        expect(motion.k('abc\ndef', 5)).toBe(1)
        expect(motion.k('\nabc\ndef', 5)).toBe(1)
        expect(motion.k('abc\nd\ne', 6, 2)).toBe(4)
        expect(motion.k('abc\nd\ne', 4, 2)).toBe(2)
    })
    test('initial col greater', () => {
        expect(motion.k('a\ndef', 4)).toBe(0)
        expect(motion.k('\na\ndef', 5)).toBe(1)
    })
    test('initial col less', () => {
        expect(motion.k('abc\nd', 4, 2)).toBe(2)
        expect(motion.k('\nabc\nd', 5, 2)).toBe(3)
    })
    test('blank line', () => {
        expect(motion.k('abc\n\n', 4)).toBe(0)
    })
    test('one line', () => {
        expect(motion.k('abc', 2)).toBe(2)
        expect(motion.k('abc\ndef', 2)).toBe(2)
    })
})

describe('j', () => {
    test('basic', () => {
        expect(motion.j('abc\ndef', 0)).toBe(4)
        expect(motion.j('abc\ndef\n', 1)).toBe(5)
        expect(motion.j('abc\nd\ne', 0, 2)).toBe(4)
        expect(motion.j('abc\nd\nef', 4, 2)).toBe(7)
    })
    test('initial col greater', () => {
        expect(motion.j('abc\nd', 2)).toBe(4)
        expect(motion.j('\nabc\nde', 3)).toBe(6)
    })
    test('initial col less', () => {
        expect(motion.j('a\nbcd', 0, 2)).toBe(4)
        expect(motion.j('\na\nbcd', 1, 2)).toBe(5)
    })
    test('blank line', () => {
        expect(motion.j('\n\nabc', 1)).toBe(2)
        expect(motion.j('ab\n\nde', 1)).toBe(3)
        expect(motion.j('ab\n\ncd', 3, 1)).toBe(5)
    })
    test('one line', () => {
        expect(motion.j('abc', 2)).toBe(2)
        expect(motion.j('abc\ndef', 4)).toBe(4)
    })
})

describe('0', () => {
    test('all 0 tests', () => {
        expect(motion.zero(' abc', 0)).toBe(0)
        expect(motion.zero(' abc', 1)).toBe(0)
        expect(motion.zero(' abc', 2)).toBe(0)
        expect(motion.zero('\n\n', 1)).toBe(1)
        expect(motion.zero('a\nb', 2)).toBe(2)
    })
})

describe('^', () => {
    test('all ^ tests', () => {
        expect(motion.caret(' abc', 0)).toBe(1)
        expect(motion.caret(' abc', 1)).toBe(1)
        expect(motion.caret(' abc', 2)).toBe(1)
        expect(motion.caret('\n\n', 1)).toBe(1)
        expect(motion.caret('a\nb', 2)).toBe(2)
        expect(motion.caret('   ', 0)).toBe(2)
    })
})

describe('$', () => {
    test('basic', () => {
        expect(motion.$(' abc', 0)).toBe(3)
        expect(motion.$(' abc\n', 1)).toBe(3)
        expect(motion.$('\n abc\n\n', 1)).toBe(4)
    })
    test('empty line', () => {
        expect(motion.$('\n\n', 0)).toBe(0)
        expect(motion.$('\n\n', 1)).toBe(1)
    })
    test('visual mode includes newline', () => {
        expect(motion.$('ab\n', 0, { in_visual_mode: true })).toBe(2)
        expect(motion.$('ab\n\n', 0, { in_visual_mode: true })).toBe(2)
        expect(motion.$('\n\n', 0, { in_visual_mode: true })).toBe(0)
    })
    test('count', () => {
        expect(motion.$('ab\ncd', 0, { count: 2 })).toBe(4)
        expect(motion.$('\nab\ncd', 1, { count: 2 })).toBe(5)
        expect(motion.$('ab\n\nc\nd\n', 0, { count: 4 })).toBe(6)
    })
})

describe('g_', () => {
    test('basic', () => {
        expect(motion.g_(' abc', 0)).toBe(3)
        expect(motion.g_(' abc\n', 0)).toBe(3)
        expect(motion.g_('\n abc\n\n', 1)).toBe(4)
    })
    test('empty line', () => {
        expect(motion.g_('\n\n', 0)).toBe(0)
        expect(motion.g_('\n\n', 1)).toBe(1)
    })
    test('spaces', () => {
        expect(motion.g_('   a ', 4)).toBe(3)
        expect(motion.g_('   ab ', 1)).toBe(4)
        expect(motion.g_('   ab \n', 5)).toBe(4)
    })
    test('count', () => {
        expect(motion.g_('ab\ncd', 0, 2)).toBe(4)
        expect(motion.g_('\nab\ncd', 1, 2)).toBe(5)
        expect(motion.g_('ab\n\nc\n d \n', 0, 4)).toBe(7)
        expect(motion.g_('ab\n\nc\n   \n', 0, 4)).toBe(6)
    })
})

describe('move', () => {
    test('single motion', () => {
        expect(motion.move({ type: 'w' }, 'abc def', 0)).toBe(4)
        expect(motion.move({ type: 'W' }, 'abc def', 0)).toBe(4)
    })
    test('multiple motions', () => {
        expect(motion.move({ type: 'e', count: 2 }, 'abc def', 0)).toBe(6)
    })
    test('k multiple motions', () => {
        expect(motion.move({ type: 'k', count: 2 }, 'abc\nd\ne', 6, 2)).toBe(2)
        expect(motion.move({ type: 'k', count: 3 }, 'abc\nd\ne', 6, 2)).toBe(2)
        expect(motion.move({ type: 'k', count: 2 }, 'abc\nd\ne', 6, 1)).toBe(1)
        expect(motion.move({ type: 'k', count: 2 }, 'abc\nd\ne', 6, 1)).toBe(1)
        expect(motion.move({ type: 'k', count: 2 }, 'abc\nd\ne', 6, 5)).toBe(2)
    })
    test('j multiple motions', () => {
        expect(motion.move({ type: 'j', count: 2 }, 'abc\nd\ne', 2)).toBe(6)
        expect(motion.move({ type: 'j', count: 4 }, 'abc\nd\ne', 2)).toBe(6)
        expect(motion.move({ type: 'j', count: 2 }, 'abc\nd\nefg', 2)).toBe(8)
    })
    test('l multiple motions', () => {
        expect(motion.move({ type: 'l', count: 5 }, 'abc\ndef', 0)).toBe(2)
    })
})
