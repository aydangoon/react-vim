import Registers from '../src/registers'

describe('registers', () => {
    test('put_yank', () => {
        const r = new Registers()
        r.put_yank('hello', false)
        expect(r.get('"')).toEqual({ value: 'hello', linewise: false })
        expect(r.get(0)).toEqual({ value: 'hello', linewise: false })
    })
    test('put_delete', () => {
        const r = new Registers()
        r.put_delete('hello', false)
        expect(r.get('"')).toEqual({ value: 'hello', linewise: false })
        expect(r.get(0)).toBeUndefined()
        expect(r.get(1)).toEqual({ value: 'hello', linewise: false })
        expect(r.get(2)).toBeUndefined()
        r.put_delete('world', true)
        expect(r.get('"')).toEqual({ value: 'world', linewise: true })
        expect(r.get(1)).toEqual({ value: 'world', linewise: true })
        expect(r.get(2)).toEqual({ value: 'hello', linewise: false })
        expect(r.get(3)).toBeUndefined()
    })
})
