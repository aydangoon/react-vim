import exp from 'constants'
import { Mode } from '../src/mode'
import { MotionType } from '../src/motion'
import Vim from '../src/vim'

const make_vim = (t) => new Vim(t)
describe('Vim motion commands', () => {
    const make_motion_cmd = (t: string, count?: number) => ({ type: <MotionType>t, count })
    const right = make_motion_cmd('l')
    const left = make_motion_cmd('h')
    const up = make_motion_cmd('k')
    const down = make_motion_cmd('j')
    test('normal mode left-right', () => {
        const v = make_vim('hello world')
        v.execute_command(right)
        expect(v.cursor).toEqual(1)
        v.execute_command(left)
        expect(v.cursor).toEqual(0)
        v.execute_command(left)
        expect(v.cursor).toEqual(0)
        v.execute_command(up)
        expect(v.cursor).toEqual(0)
        v.execute_command(down)
        expect(v.cursor).toEqual(0)
    })
    test('normal mode up-down', () => {
        const v = make_vim('hello\nworld')
        v.execute_command(down)
        expect(v.cursor).toEqual(6)
        v.execute_command(up)
        expect(v.cursor).toEqual(0)
        v.execute_command(right)
        v.execute_command(down)
        expect(v.cursor).toEqual(7)
    })
    test('normal mode blank line', () => {
        const v = make_vim('ab\n\ncd')
        v.execute_command(right)
        v.execute_command(down)
        expect(v.cursor).toEqual(3)
        v.execute_command(down)
        expect(v.cursor).toEqual(5)
    })
    test('normal mode motions with count', () => {
        const v = make_vim('ab\n\ncd')
        v.execute_command(make_motion_cmd('l', 5))
        expect(v.cursor).toEqual(1)
        v.execute_command(make_motion_cmd('j', 2))
        expect(v.cursor).toEqual(5)
    })
})

describe('Vim mode commands', () => {
    test('all transitions', () => {
        const v = make_vim('hello world')
        expect(v.mode).toEqual(Mode.Normal)
        v.execute_command({ type: 'i' })
        expect(v.mode).toEqual(Mode.Insert)
        v.reset()
        expect(v.mode).toEqual(Mode.Normal)
        v.execute_command({ type: 'v' })
        expect(v.mode).toEqual(Mode.Visual)
        v.execute_command({ type: 'v' })
        expect(v.mode).toEqual(Mode.Normal)
        v.execute_command({ type: 'R' })
        expect(v.mode).toEqual(Mode.Replace)
    })
})

const input_string = (v: Vim, s: string) => {
    for (const c of s) {
        v.input(c)
    }
}

describe('insert mode', () => {
    test('basic insert', () => {
        const v = make_vim('world')
        v.execute_command({ type: 'i' })
        v.input('h')
        expect(v.text).toEqual('hworld')
        expect(v.cursor).toEqual(1)
        v.input('Backspace')
        expect(v.text).toEqual('world')
        expect(v.cursor).toEqual(0)
        input_string(v, 'hello ')
        expect(v.text).toEqual('hello world')
        expect(v.cursor).toEqual(6)
        expect(v.mode).toEqual(Mode.Insert)
        for (let i = 0; i < 10; i++) {
            v.input('Backspace')
        }
        expect(v.text).toEqual('world')
        expect(v.cursor).toEqual(0)
    })
    test('insert extends text', () => {
        const v = make_vim('abc')
        v.execute_command({ type: 'g_' })
        v.execute_command({ type: 'i' })
        v.input('d')
        expect(v.text).toEqual('abdc')
        expect(v.cursor).toEqual(3)
        v.reset()
        expect(v.text).toEqual('abdc')
        expect(v.cursor).toEqual(3)
    })
    test('insert special characters', () => {
        const v = make_vim('a')
        v.execute_command({ type: 'i' })
        v.input('Enter')
        expect(v.text).toEqual('\na')
        expect(v.cursor).toEqual(1)
        v.input('b')
        expect(v.text).toEqual('\nba')
        expect(v.cursor).toEqual(2)
        v.input('Tab')
        expect(v.text).toEqual('\nb\ta')
    })
})
