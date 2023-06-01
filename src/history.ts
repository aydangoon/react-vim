import { string_delete, string_insert } from './utils'

interface Change {
    before_cursor: number
    after_cursor: number
    text_pos: number
    text: string
    is_adding: boolean
}
type Action = Change[]

class _History {
    private history: Action[] = []
    private redo_history: Action[] = []
    private curr_action: Action = []

    public add_change(change: Change) {
        this.curr_action.unshift(change)
        return this
    }
    public commit() {
        const len = this.history.unshift(this.curr_action)
        if (len > 10) this.history.pop()
        this.redo_history = []
        this.curr_action = []
        return this
    }
    public undo(t: string): { cursor: number; text: string } | null {
        if (this.history.length === 0) return null
        const action = this.history.shift()
        let new_text = t
        let new_cursor
        for (let i = 0; i < action.length; i++) {
            const { before_cursor, text_pos, text, is_adding } = action[i]
            new_text = is_adding
                ? string_delete(new_text, text_pos, text_pos + text.length - 1)
                : string_insert(new_text, text, text_pos)
            if (i === action.length - 1) new_cursor = before_cursor
        }
        const len = this.redo_history.unshift(action)
        if (len > 10) this.redo_history.pop()
        return { cursor: new_cursor, text: new_text }
    }

    public redo(t: string): { cursor: number; text: string } | null {
        if (this.redo_history.length === 0) return null
        const action = this.redo_history.shift()
        let new_text = t
        let new_cursor
        for (let i = 0; i < action.length; i++) {
            const { after_cursor, text_pos, text, is_adding } = action[i]
            new_text = is_adding
                ? string_insert(new_text, text, text_pos)
                : string_delete(new_text, text_pos, text_pos + text.length - 1)
            if (i === action.length - 1) new_cursor = after_cursor
        }
        const len = this.history.unshift(action)
        if (len > 10) this.history.pop()
        return { cursor: new_cursor, text: new_text }
    }
}

export default _History
