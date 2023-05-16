import { parse_command } from '../src/command'

describe('parse_command', () => {
    test('valid motions', () => {
        expect(parse_command('w')).toEqual({ count: 1, type: 'w' })
        expect(parse_command('2W')).toEqual({ count: 2, type: 'W' })
        expect(parse_command('20e')).toEqual({ count: 20, type: 'e' })
        expect(parse_command('E')).toEqual({ count: 1, type: 'E' })
        expect(parse_command('b')).toEqual({ count: 1, type: 'b' })
        expect(parse_command('B')).toEqual({ count: 1, type: 'B' })
        expect(parse_command('3ge')).toEqual({ count: 3, type: 'ge' })
        expect(parse_command('4gE')).toEqual({ count: 4, type: 'gE' })
        expect(parse_command('h')).toEqual({ count: 1, type: 'h' })
        expect(parse_command('l')).toEqual({ count: 1, type: 'l' })
        expect(parse_command('k')).toEqual({ count: 1, type: 'k' })
        expect(parse_command('j')).toEqual({ count: 1, type: 'j' })
        expect(parse_command('0')).toEqual({ count: 1, type: '0' })
        expect(parse_command('^')).toEqual({ count: 1, type: '^' })
        expect(parse_command('100$')).toEqual({ count: 100, type: '$' })
        expect(parse_command('301g_')).toEqual({ count: 301, type: 'g_' })
    })
    test('invalid motions', () => {
        expect(parse_command('10')).toBeNull()
    })
})
