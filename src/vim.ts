/**
 *
 * @module
 */

import { Mode } from './mode'
import { Command, parse_command } from './command'

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
        this.cmd_buffer = ''

        // attach additional appropriate command-based options derived from
        // the current state
        switch (cmd.type) {
            case '$':
                cmd.options['in_visual_mode'] = this.mode === Mode.Visual
                break
        }

        this.execute_command(cmd)
    }

    execute_command(cmd: Command) {
        // TODO: update state and elements wrt the command
    }
}

export default Vim
