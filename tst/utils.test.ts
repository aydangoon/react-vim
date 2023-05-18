import { string_delete, string_insert } from '../src/utils'

describe('utils', () => {
    test('string_delete', () => {
        expect(string_delete('abc', 0, 1)).toEqual('c')
        expect(string_delete('abc', 1, 0)).toEqual('c')
        expect(string_delete('abc', 0, 0)).toEqual('bc')
        expect(string_delete('abcd', 1, 2)).toEqual('ad')
    })
    test('string_insert', () => {
        expect(string_insert('abc', 'd', 0)).toEqual('dabc')
        expect(string_insert('abc', 'dog', 1)).toEqual('adogbc')
    })
})
