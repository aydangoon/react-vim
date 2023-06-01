import _History from '../src/history'

describe('adding to history', () => {
    test('undo an add', () => {
        const h = new _History()
        const t = 'hifrog'
        h.add_change({
            after_cursor: 0,
            before_cursor: 0,
            text_pos: 0,
            text: 'hi',
            is_adding: true,
        })
        expect(h.undo(t)).toBeNull()
        h.commit()
        expect(h.undo(t)).toEqual({ text: 'frog', cursor: 0 })
    })
    test('undo a remove', () => {
        const h = new _History()
        const t = 'frog'
        h.add_change({
            after_cursor: 2,
            before_cursor: 2,
            text_pos: 1,
            text: 'hi',
            is_adding: false,
        })
        expect(h.undo(t)).toBeNull()
        h.commit()
        expect(h.undo(t)).toEqual({ text: 'fhirog', cursor: 2 })
    })
    test('undo action with multiple changes', () => {
        const h = new _History()
        let t = 'frog'
        h.add_change({
            after_cursor: 0,
            before_cursor: 0,
            text_pos: 0,
            text: 'hi ',
            is_adding: true,
        })
        t = 'hi frog'
        h.add_change({
            after_cursor: 4,
            before_cursor: 4,
            text_pos: 4,
            text: 'r',
            is_adding: false,
        })
        t = 'hi fog'
        h.commit()
        expect(h.undo(t)).toEqual({ text: 'frog', cursor: 0 })
    })
})

describe('redo', () => {
    test('undo + redo', () => {
        const h = new _History()
        let text = 'hi'
        // x at pos 1
        h.add_change({
            after_cursor: 0,
            before_cursor: 1,
            text_pos: 1,
            text: 'i',
            is_adding: false,
        })
        h.commit()
        text = 'h'
        text = h.undo(text)?.text
        expect(text).toEqual('hi')
        text = h.redo(text)?.text
        expect(text).toEqual('h')
        text = h.undo(text)?.text
        expect(text).toEqual('hi')
    })
    test('undo + redo new history branch', () => {
        const h = new _History()
        let text = 'hi'
        // x at pos 1
        h.add_change({
            after_cursor: 0,
            before_cursor: 1,
            text_pos: 1,
            text: 'i',
            is_adding: false,
        })
        h.commit()
        text = 'h'
        text = h.undo(text)?.text
        expect(text).toEqual('hi')
        text = h.redo(text)?.text
        expect(text).toEqual('h')
        h.add_change({ after_cursor: 2, before_cursor: 1, text_pos: 1, text: 'a', is_adding: true })
        h.commit()
        text = 'ha'
        expect(h.redo(text)).toBeNull()
        text = h.undo(text)?.text
        expect(text).toEqual('h')
        text = h.redo(text)?.text
        expect(text).toEqual('ha')
    })
})
