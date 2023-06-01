import { MotionType, RGX_motion } from './motion'

export enum Mode {
    Normal = '-- NORMAL --',
    Insert = '-- INSERT --',
    Visual = '-- VISUAL --',
    VisualLine = '-- VISUAL LINE --',
    VisualBlock = '-- VISUAL BLOCK --',
    Replace = '-- REPLACE --',
    CommandLine = '-- COMMAND LINE --',
}

type CommandOptions = { [key: string]: any }
export type CommandType =
    | MotionType
    | InsertCommandType
    | DeleteCommandType
    | CopyAndMoveCommandType
    | ChangeCommandType
    | VisualCommandType
export interface Command {
    count?: number
    type: CommandType
    options?: CommandOptions
}

const RGX_count = /[1-9][0-9]*/
export const INSERT_COMMAND_TYPES = ['a', 'A', 'i', 'I', 'o', 'O'] as const
export type InsertCommandType = (typeof INSERT_COMMAND_TYPES)[number]
export const RGX_insert_command_type = new RegExp(INSERT_COMMAND_TYPES.join('|'))

export const DELETE_COMMAND_TYPES = ['d', 'dd', 'D', 'x', 'X', 'J'] as const
export type DeleteCommandType = (typeof DELETE_COMMAND_TYPES)[number]
export const RGX_delete_command_type = /dd?|D|x|X|J/

export const COPY_AND_MOVE_COMMAND_TYPES = ['y', 'yy', 'Y', 'p', 'P'] as const
export type CopyAndMoveCommandType = (typeof COPY_AND_MOVE_COMMAND_TYPES)[number]
export const RGX_copy_and_move_command_type = /yy?|Y|p|P/

// TODO: temporarily using f in place of ctrl-R
export const CHANGE_COMMAND_TYPES = ['r', 'R', 'c', 'cc', 'C', '~', 'u', 'f'] as const
export type ChangeCommandType = (typeof CHANGE_COMMAND_TYPES)[number]
export const RGX_change_command_type = /r|R|cc?|C|~|u|f/

export const VISUAL_COMMAND_TYPES = ['v', 'V'] as const
export type VisualCommandType = (typeof VISUAL_COMMAND_TYPES)[number]
export const RGX_visual_command_type = /v|V/

const command_type_rgxs = [
    RGX_motion.source,
    RGX_insert_command_type.source,
    RGX_delete_command_type.source,
    RGX_copy_and_move_command_type.source,
    RGX_change_command_type.source,
    RGX_visual_command_type.source,
]
const RGX_command_type = new RegExp(command_type_rgxs.join('|'))

// TODO: this parsing needs to be separated from the command types,
// i.e. ciw vs c in visual mode
export const parse_command = (s: string, mode: Mode = Mode.Normal): Command | null => {
    let count = 1
    let type: CommandType | undefined
    let options: CommandOptions = {}

    // parse count
    const count_match = RGX_count.exec(s)
    if (count_match && count_match.index === 0) {
        count = parseInt(count_match[0])
        s = s.substring(count_match[0].length)
    }

    // match command type
    const type_match = RGX_command_type.exec(s)
    if (!type_match || type_match.index !== 0) return null
    type = type_match[0] as CommandType
    s = s.substring(type_match[0].length)

    // command type specific parsing, prettier-ignore
    switch (type) {
        case 'y':
        case 'c':
        case 'd':
            if (mode !== Mode.Normal) break
            options['motion'] = parse_command(s, mode)
            if (!options['motion']) return null
            break
        case 'r':
            if (s.length !== 1) return null
            options['char'] = s
            break
        case '$':
            options['in_visual_mode'] = mode === Mode.Visual
            break
    }

    return { count, type, options: Object.keys(options).length > 0 ? options : undefined }
}
