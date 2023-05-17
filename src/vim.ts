/**
 *
 * @module
 */

import { Mode, Command, parse_command } from './command'
import { MOTION_TYPES, MotionType, get_column, move } from './motion'
import { key_event_key_to_char } from './utils'

/**
 * The Vim state. Constructed with a textarea and input elements or a string. If constructed with
 * elements, the elements will be synced with the Vim state.
 */
class Vim {
    mode: Mode = Mode.Normal
    text: string = ''
    textarea: HTMLTextAreaElement | null = null
    // the text in the command line. e.g. ':%s/foo/bar/g'
    cmdline_text: string = Mode.Normal
    cmdline: HTMLInputElement | null = null
    cursor: number = 0
    desired_col: number = 0
    selection: [number, number] = [0, 0]
    // the command being built, e.g. 'd3w'.
    cmd_buffer: string = ''

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
            case Mode.Normal:
            case Mode.Visual:
                this.push_to_cmd_buffer(key)
                break
            case Mode.Insert:
                this.insert_input(key)
                break
            case Mode.Replace:
                //this.handle_input_replace(key)
                break
            case Mode.CommandLine:
                this.command_line_input(key)
                break
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
        const cmd = parse_command(this.cmd_buffer)
        if (!cmd) return

        // attach additional appropriate command-based options derived from
        // the current state
        switch (cmd.type) {
            case '$':
                cmd.options['in_visual_mode'] = this.mode === Mode.Visual
                break
        }

        this.cmd_buffer = ''
        this.execute_command(cmd)
    }

    execute_command(cmd: Command) {
        const { count, type, options } = cmd
        const col = get_column(this.text, this.cursor)
        // motion command
        if (MOTION_TYPES.includes(<any>type)) {
            const motion_type = <MotionType>type
            const desired_col = this.desired_col > col ? this.desired_col : col
            //console.log('cmd', cmd)
            const new_pos = move(
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
                    const start = Math.min(this.cursor, new_pos)
                    const end = Math.max(this.cursor, new_pos)
                    this.selection = [start, end + 1]
            }
            // all other commands
        } else {
            // prettier-ignore
            switch (type) {
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
            }
        }

        // TODO: update state and elements wrt the command

        // update desired_col
        const new_col = get_column(this.text, this.cursor)
        if (cmd.type !== 'j' && cmd.type !== 'k') this.desired_col = new_col
        this.sync_textarea()
    }

    a(cmd: Command) {}
    A(cmd: Command) {}
    i(cmd: Command) {
        this.mode = Mode.Insert
    }
    I(cmd: Command) {}
    o(cmd: Command) {}
    O(cmd: Command) {}
    d(cmd: Command) {}
    dd(cmd: Command) {}
    D(cmd: Command) {}
    x(cmd: Command) {}
    X(cmd: Command) {}
    J(cmd: Command) {}
    y(cmd: Command) {}
    yy(cmd: Command) {}
    Y(cmd: Command) {}
    p(cmd: Command) {}
    P(cmd: Command) {}
    r(cmd: Command) {}
    R(cmd: Command) {
        this.mode = Mode.Replace
    }
    c(cmd: Command) {}
    cc(cmd: Command) {}
    tilde(cmd: Command) {}
    u(cmd: Command) {}
    U(cmd: Command) {}
    v(cmd: Command) {
        if (this.mode === Mode.Visual) {
            this.mode = Mode.Normal
            this.selection = [this.cursor, this.cursor]
        } else {
            this.mode = Mode.Visual
            this.selection = [this.cursor, this.cursor + 1]
        }
    }
    V(cmd: Command) {}

    // for when escape is given as input
    reset() {
        this.cmd_buffer = ''
        this.mode = Mode.Normal
        this.cmdline_text = this.mode
    }

    sync_textarea() {
        if (!this.textarea) return
        this.textarea.value = this.text
        if (this.mode === Mode.Visual) {
            this.textarea.setSelectionRange(this.selection[0], this.selection[1])
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
