/**
 *
 * @module
 */

import { Mode, Command, parse_command } from './command'
import {
    MotionType,
    get_column,
    is_exclusive,
    is_linewise,
    move as motion_move,
    row_end,
    row_start,
} from './motion'
import Registers from './registers'
import { key_event_key_to_char, string_delete } from './utils'

/**
 * The Vim state. Constructed with a textarea and input elements or a string. If constructed with
 * elements, the elements will be synced with the Vim state.
 */
class Vim {
    mode: Mode = Mode.Normal
    text: string = ''
    textarea: HTMLTextAreaElement | null = null
    cmdline_text: string = Mode.Normal // the text in the command line. e.g. ':%s/foo/bar/g'
    cmdline: HTMLInputElement | null = null
    cursor: number = 0
    desired_col: number = 0
    visual_cursor: number = 0
    visual_line_range: [number, number] = [0, 0]
    cmd_buffer: string = '' // the command being built, e.g. 'd3w'.
    is_appending: boolean = false // was last command an append?
    registers: Registers = new Registers()

    constructor(textarea: HTMLTextAreaElement, cmdline: HTMLInputElement)
    constructor(text: string)
    constructor(...args: any[]) {
        if (args[0] instanceof HTMLTextAreaElement) {
            this.textarea = args[0]
            this.text = this.textarea.value
            this.cmdline = args[1]
        } else {
            this.text = args[0]
        }
    }

    input(key: string) {
        if (key === 'Escape') {
            this.reset()
            return
        }
        switch (this.mode) {
            case Mode.Insert:
                this.insert_input(key)
                break
            case Mode.Replace:
                //this.handle_input_replace(key)
                break
            case Mode.CommandLine:
                this.command_line_input(key)
                break
            default:
                this.push_to_cmd_buffer(key)
        }
    }

    insert_input(key: string) {
        if (key === 'Backspace' && this.cursor > 0) {
            this.text = this.text.slice(0, this.cursor - 1) + this.text.slice(this.cursor)
            this.cursor--
        } else if (key !== 'Backspace') {
            this.text =
                this.text.slice(0, this.cursor) +
                key_event_key_to_char(key) +
                this.text.slice(this.cursor)
            this.cursor++
        }
        this.sync_textarea()
    }

    command_line_input(key: string) {
        if (key === 'Enter') {
            this.execute_command_line()
        } else if (key === 'Backspace') {
            this.cmdline_text = this.cmdline_text.slice(0, this.cmdline_text.length - 1)
        } else {
            this.cmdline_text += key
        }
        this.sync_cmdline()
    }

    execute_command_line() {
        // TODO: implement
        this.cmdline_text = ''
    }

    push_to_cmd_buffer(char: string) {
        this.cmd_buffer += char
        const cmd = parse_command(this.cmd_buffer, this.mode)
        if (!cmd) return
        this.cmd_buffer = ''
        this.execute_command(cmd)
    }

    execute_command(cmd: Command) {
        // prettier-ignore
        switch (cmd.type) {
                case 'a':  this.a(cmd); break
                case 'A':  this.A(cmd); break
                case 'i':  this.i(cmd); break
                case 'I':  this.I(cmd); break
                case 'o':  this.o(cmd); break
                case 'O':  this.O(cmd); break
                case 'd':  this.d(cmd); break
                case 'dd': this.dd(cmd); break
                case 'D':  this.D(cmd); break
                case 'x':  this.x(cmd); break
                case 'X':  this.X(cmd); break
                case 'J':  this.J(cmd); break
                case 'y':  this.y(cmd); break
                case 'yy': this.yy(cmd); break
                case 'Y':  this.Y(cmd); break
                case 'p':  this.p(cmd); break
                case 'P':  this.P(cmd); break
                case 'r':  this.r(cmd); break
                case 'R':  this.R(cmd); break
                case 'c':  this.c(cmd); break
                case 'cc': this.cc(cmd); break
                case 'C':  this.C(cmd); break
                case '~':  this.tilde(cmd); break
                case 'u':  this.u(cmd); break
                case 'v':  this.v(cmd); break
                case 'V':  this.V(cmd); break
                default:   this.move(cmd); break
            }

        // update desired_col
        const new_col = get_column(this.text, this.cursor)
        if (cmd.type !== 'j' && cmd.type !== 'k') this.desired_col = new_col
        this.sync_textarea()
    }

    a(cmd: Command) {
        this.mode = Mode.Insert
        this.is_appending = true
        this.cursor++
    }
    A(cmd: Command) {
        this.move({ type: '$' })
        this.a(cmd)
    }
    i(cmd: Command) {
        this.mode = Mode.Insert
        this.is_appending = this.text === '' || this.cursor === this.text.length
    }
    I(cmd: Command) {
        this.move({ type: '^' })
        this.i(cmd)
    }
    o(cmd: Command) {
        let next_newline = this.text.indexOf('\n', this.cursor)
        if (next_newline === -1) {
            this.text += '\n'
            this.cursor = this.text.length
            this.is_appending = true
        } else {
            this.text = this.text.slice(0, next_newline) + '\n' + this.text.slice(next_newline)
            this.cursor = next_newline + 1
        }
        this.mode = Mode.Insert
    }
    O(cmd: Command) {
        let prev_newline = this.text.lastIndexOf('\n', this.cursor - 1)
        if (this.cursor === 0 || prev_newline === -1) {
            this.text = '\n' + this.text
            this.cursor = 0
        } else {
            this.text = this.text.slice(0, prev_newline) + '\n' + this.text.slice(prev_newline)
            this.cursor = prev_newline + 1
        }
        this.is_appending = true
        this.mode = Mode.Insert
    }
    d(cmd: Command) {
        if (this.mode === Mode.VisualLine) {
            this.text = string_delete(
                this.text,
                this.visual_line_range[0],
                this.visual_line_range[1]
            )
            this.mode = Mode.Normal
            // cursor tries to stay on visual line range start otherwise goes to start of previous line
            this.cursor =
                this.visual_line_range[0] < this.text.length - 1
                    ? this.visual_line_range[0]
                    : row_start(this.text, this.visual_line_range[0] - 1, false)
        } else if (this.mode === Mode.Visual) {
            this.text = string_delete(this.text, this.cursor, this.visual_cursor)
            this.mode = Mode.Normal
            this.cursor = Math.min(
                this.visual_cursor < this.cursor ? this.visual_cursor : this.cursor,
                this.text.length - 1
            )
        } else {
            const motion = cmd.options?.motion
            if (!motion) throw new Error('d: Motion required')
            const new_pos = motion_move(motion, this.text, this.cursor, this.desired_col)
            if (is_linewise(motion.type)) {
                const start = row_start(
                    this.text,
                    this.cursor < new_pos ? this.cursor : new_pos,
                    true
                )
                const prev_line_start = start === 0 ? 0 : row_start(this.text, start - 1, false)
                const end = row_end(this.text, this.cursor < new_pos ? new_pos : this.cursor, true)
                this.text = string_delete(this.text, start, end)
                this.cursor = this.text.length - 1 < start ? prev_line_start : start
            } else {
                this.text = string_delete(
                    this.text,
                    this.cursor,
                    new_pos - (is_exclusive(motion.type) ? 1 : 0)
                )
                this.cursor = this.cursor < new_pos ? this.cursor : new_pos
                if (this.cursor !== 0 && this.text[this.cursor] === '\n') this.cursor--
            }
        }
    }
    dd(cmd: Command) {
        const start_exclusive = this.cursor === 0 ? -1 : this.text.indexOf('\n', this.cursor - 1)
        let next_nl = this.text.indexOf('\n', this.cursor)
        const end_excusive = next_nl === -1 ? this.text.length : next_nl + 1
        this.text = this.text.slice(0, start_exclusive + 1) + this.text.slice(end_excusive)
        // TODO: update logic and set cursor position
    }
    D(cmd: Command) {
        this.d({ type: 'd', options: { motion: { type: '$' } } })
    }
    x(cmd: Command) {
        this.text = this.text.slice(0, this.cursor) + this.text.slice(this.cursor + 1)
        if (this.cursor !== 0 && this.text[this.cursor] === '\n') this.cursor--
    }
    X(cmd: Command) {
        if (this.cursor === 0) return
        this.cursor--
        this.x(cmd)
    }
    J(cmd: Command) {
        let next_nl = this.text.indexOf('\n', this.cursor)
        if (next_nl === -1) return
        this.text = this.text.slice(0, next_nl) + ' ' + this.text.slice(next_nl + 1)
        this.cursor = next_nl
    }
    y(cmd: Command) {
        // TODO: implement. cursor identical to d, no delete, just store yanked text in register
        let yank_text
        let linewise
        if (this.mode === Mode.VisualLine) {
            yank_text = this.text.slice(this.visual_line_range[0], this.visual_line_range[1] + 1)
            linewise = true
            this.mode = Mode.Normal
            this.cursor = this.visual_line_range[0]
        } else if (this.mode === Mode.Visual) {
            const cursor_first = this.cursor < this.visual_cursor
            const start = cursor_first ? this.cursor : this.visual_cursor
            const end = cursor_first ? this.visual_cursor : this.cursor
            yank_text = this.text.slice(start, end + 1)
            linewise = false
            this.mode = Mode.Normal
            this.cursor = start
        } else {
            const motion = cmd.options?.motion
            if (!motion) throw new Error('y: requires motion in normal mode')
            const new_pos = motion_move(motion, this.text, this.cursor, this.desired_col)
            if (is_linewise(motion.type)) {
                const start = row_start(
                    this.text,
                    this.cursor < new_pos ? this.cursor : new_pos,
                    true
                )
                const end = row_end(this.text, this.cursor < new_pos ? new_pos : this.cursor, true)
                yank_text = this.text.slice(start, end + 1)
                this.cursor = start
            } else {
                yank_text = this.text.slice(
                    this.cursor,
                    new_pos - (is_exclusive(motion.type) ? 1 : 0) + 1
                )
                this.cursor = this.cursor < new_pos ? this.cursor : new_pos
            }
            linewise = is_linewise(motion.type)
        }
        // TODO: if a register is specified, put it there
        this.registers.put_yank(yank_text, linewise)
    }
    yy(cmd: Command) {}
    Y(cmd: Command) {
        this.y({ type: 'y', options: { motion: { type: '$' } } })
    }
    p(cmd: Command) {
        // TODO: there's a weird case where a characterwise motion with text that ends in a newline
        // places the cursor at the start of the paste instead of the end. explore this.
        const reg_type = cmd.options?.register || '"'
        const reg_value = this.registers.get(reg_type)
        if (!reg_value) return
        if (reg_value.linewise) {
            const end = row_end(this.text, this.cursor, true)
            const insert_nl_before = this.text[end] !== '\n'
            const insert_nl_after = reg_value.value[reg_value.value.length - 1] !== '\n'
            this.text =
                this.text.slice(0, end + 1) +
                (insert_nl_before ? '\n' : '') +
                reg_value.value +
                (insert_nl_after ? '\n' : '') +
                this.text.slice(end + 1)
            this.cursor = end + 1 + (insert_nl_before ? 1 : 0)
        } else {
            this.text =
                this.text.slice(0, this.cursor + 1) +
                reg_value.value +
                this.text.slice(this.cursor + 1)
            this.cursor += reg_value.value.length
        }
    }
    P(cmd: Command) {
        const reg_type = cmd.options?.register || '"'
        const reg_value = this.registers.get(reg_type)
        if (!reg_value) return
        if (reg_value.linewise) {
            const start = row_start(this.text, this.cursor, true)
            const insert_newline = reg_value.value[reg_value.value.length - 1] !== '\n'
            this.text =
                this.text.slice(0, start + Number(start !== 0)) +
                reg_value.value +
                (insert_newline ? '\n' : '') +
                this.text.slice(start + Number(start !== 0))
            this.cursor = start + Number(start !== 0)
        } else {
            this.text =
                this.text.slice(0, this.cursor) + reg_value.value + this.text.slice(this.cursor)
            this.cursor += reg_value.value.length - 1
        }
    }
    r(cmd: Command) {
        if (this.text.length === 0 || this.cursor === this.text.length) return
        if (this.text[this.cursor] === '\n') return

        this.text =
            this.text.slice(0, this.cursor) +
            key_event_key_to_char(cmd.options['char']) +
            this.text.slice(this.cursor + 1)
    }
    R(cmd: Command) {
        this.mode = Mode.Replace
    }
    c(cmd: Command) {
        if (this.mode === Mode.Visual) {
            this.text = string_delete(this.text, this.cursor, this.visual_cursor)
            this.cursor = Math.min(
                this.visual_cursor < this.cursor ? this.visual_cursor : this.cursor,
                this.text.length - 1
            )
        } else {
            const motion = cmd.options?.motion
            if (!motion) throw new Error('c: Motion required')
            const new_pos = motion_move(motion, this.text, this.cursor, this.desired_col)
            if (is_linewise(motion.type)) {
                const start = row_start(
                    this.text,
                    this.cursor < new_pos ? this.cursor : new_pos,
                    false
                )
                const prev_line_start = start === 0 ? 0 : row_start(this.text, start - 1, false)
                const end = row_end(this.text, this.cursor < new_pos ? new_pos : this.cursor, false)
                this.text = string_delete(this.text, start, end)
                this.cursor = this.text.length - 1 < start ? prev_line_start : start
            } else {
                this.text = string_delete(
                    this.text,
                    this.cursor,
                    new_pos - (is_exclusive(motion.type) ? 1 : 0)
                )
                this.cursor = this.cursor < new_pos ? this.cursor : new_pos
            }
        }
        this.mode = Mode.Insert
    }
    C(cmd: Command) {
        this.c({ type: 'c', options: { motion: { type: '$' } } })
        this.is_appending = true
    }
    cc(cmd: Command) {
        this.move({ type: '^' })
        this.C(cmd)
    }
    tilde(cmd: Command) {
        if (this.mode === Mode.Normal) {
            const c = this.text[this.cursor]
            const new_c = c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
            this.text = this.text.slice(0, this.cursor) + new_c + this.text.slice(this.cursor + 1)
        } else {
            const start = this.mode === Mode.Visual ? this.cursor : this.visual_line_range[0]
            const end = this.mode === Mode.Visual ? this.visual_cursor : this.visual_line_range[1]
            const new_chars = this.text
                .slice(start, end + 1)
                .split('')
                .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
                .join('')
            this.text = this.text.slice(0, start) + new_chars + this.text.slice(end + 1)
        }
    }
    u(cmd: Command) {}
    v(cmd: Command) {
        this.mode = this.mode === Mode.Visual ? Mode.Normal : Mode.Visual
        this.visual_cursor = this.cursor
    }
    V(cmd: Command) {
        this.mode = this.mode === Mode.Visual ? Mode.Normal : Mode.VisualLine
        this.visual_cursor = this.cursor
        const is_cursor_first = this.cursor < this.visual_cursor
        this.visual_line_range = [
            row_start(this.text, is_cursor_first ? this.cursor : this.visual_cursor, false),
            row_end(this.text, is_cursor_first ? this.visual_cursor : this.cursor, false),
        ]
    }
    move({ type, count, options }: Command) {
        const motion_type = <MotionType>type
        const col = get_column(this.text, this.cursor)
        const desired_col = this.desired_col > col ? this.desired_col : col
        //console.log('cmd', cmd)
        const new_pos = motion_move(
            { count, type: motion_type, options },
            this.text,
            this.cursor,
            desired_col
        )
        switch (this.mode) {
            case Mode.Normal:
                this.cursor = new_pos
                break
            case Mode.Visual:
                this.visual_cursor = new_pos
                break
            case Mode.VisualLine:
                this.visual_cursor = new_pos
                const is_cursor_first = this.cursor < this.visual_cursor
                this.visual_line_range = [
                    row_start(this.text, is_cursor_first ? this.cursor : this.visual_cursor, false),
                    row_end(this.text, is_cursor_first ? this.visual_cursor : this.cursor, false),
                ]
        }
    }

    // for when escape is given as input
    reset() {
        this.cmd_buffer = ''
        this.mode = Mode.Normal
        this.cmdline_text = this.mode
        if (this.is_appending) this.cursor--
        this.is_appending = false
    }

    sync_textarea() {
        if (!this.textarea) return
        this.textarea.value = this.text
        switch (this.mode) {
            case Mode.Normal:
                this.textarea.setSelectionRange(this.cursor, this.cursor)
                break
            case Mode.Visual:
                if (this.visual_cursor <= this.cursor) {
                    this.textarea.setSelectionRange(this.visual_cursor, this.cursor + 1)
                } else {
                    this.textarea.setSelectionRange(this.cursor, this.visual_cursor + 1)
                }
                break
            case Mode.VisualLine:
                this.textarea.setSelectionRange(
                    this.visual_line_range[0],
                    this.visual_line_range[1] + 1
                )
        }
    }

    sync_cmdline() {
        if (!this.cmdline) return
        this.cmdline.value = this.cmdline_text
    }
}

export default Vim
