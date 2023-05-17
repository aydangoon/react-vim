/**
 *
 * @module
 */

import { MODE_COMMAND_TYPES, Mode, ModeCommandType, switch_mode } from './mode'
import { Command, parse_command } from './command'
import { MOTION_TYPES, Motion, MotionType, get_column, move } from './motion'

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
        // motion
        if (MOTION_TYPES.includes(<any>type)) {
            const motion_type = <MotionType>type
            const desired_col = this.desired_col > col ? this.desired_col : col
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
        }
        // mode command
        if (MODE_COMMAND_TYPES.includes(<any>type)) {
            this.mode = switch_mode(this.mode, type as ModeCommandType)
        }

        // TODO: update state and elements wrt the command

        // update desired_col
        const new_col = get_column(this.text, this.cursor)
        if (cmd.type !== 'j' && cmd.type !== 'k') this.desired_col = new_col
    }
}

export default Vim
