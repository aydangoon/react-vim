/**
 *
 * @module
 */

import { Mode, Command, parse_command } from './command'
import { MotionType, get_column, is_exclusive, move as motion_move } from './motion'
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
    visual_start: number = 0
    cmd_buffer: string = '' // the command being built, e.g. 'd3w'.
    is_appending: boolean = false // was last command an append?

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
                case '~':  this.tilde(cmd); break
                case 'u':  this.u(cmd); break
                case 'U':  this.U(cmd); break
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
        if (this.mode === Mode.Visual) {
            this.text = string_delete(this.text, this.cursor, this.visual_start)
            this.mode = Mode.Normal
            this.cursor = Math.min(
                this.visual_start < this.cursor ? this.visual_start : this.cursor,
                this.text.length - 1
            )
        } else {
            const motion = cmd.options?.motion
            if (!motion) throw new Error('d: Motion required')
            const new_pos = motion_move(motion, this.text, this.cursor, this.desired_col)
            const exclusive = is_exclusive(motion.type)
            this.text = string_delete(this.text, this.cursor, new_pos - (exclusive ? 1 : 0))
            // TODO: cursor position? i can't find in the docs how this works,
            // but its probably something to do with linewise vs charwise motions
        }
    }
    dd(cmd: Command) {
        const start_exclusive = this.cursor === 0 ? -1 : this.text.indexOf('\n', this.cursor - 1)
        let next_nl = this.text.indexOf('\n', this.cursor)
        const end_excusive = next_nl === -1 ? this.text.length : next_nl + 1
        this.text = this.text.slice(0, start_exclusive + 1) + this.text.slice(end_excusive)
    }
    D(cmd: Command) {
        let next_nl = this.text.indexOf('\n', this.cursor)
        const end_excusive = next_nl === -1 ? this.text.length : next_nl

        this.text = this.text.slice(0, this.cursor) + this.text.slice(end_excusive)
        this.cursor -= this.cursor === 0 || this.text[this.cursor - 1] === '\n' ? 0 : 1
    }
    x(cmd: Command) {
        this.text = this.text.slice(0, this.cursor) + this.text.slice(this.cursor + 1)
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
    y(cmd: Command) {}
    yy(cmd: Command) {}
    Y(cmd: Command) {}
    p(cmd: Command) {}
    P(cmd: Command) {}
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
    c(cmd: Command) {}
    cc(cmd: Command) {}
    tilde(cmd: Command) {}
    u(cmd: Command) {}
    U(cmd: Command) {}
    v(cmd: Command) {
        this.mode = this.mode === Mode.Visual ? Mode.Normal : Mode.Visual
        this.visual_start = this.cursor
    }
    V(cmd: Command) {}
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
                this.visual_start = new_pos
                break
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
        if (this.mode === Mode.Visual) {
            if (this.visual_start <= this.cursor) {
                this.textarea.setSelectionRange(this.visual_start, this.cursor + 1)
            } else {
                this.textarea.setSelectionRange(this.cursor, this.visual_start + 1)
            }
        } else {
            this.textarea.setSelectionRange(this.cursor, this.cursor)
        }
    }

    sync_cmdline() {
        if (!this.cmdline) return
        this.cmdline.value = this.cmdline_text
    }
}

export default Vim
