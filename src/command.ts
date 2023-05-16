import { MotionType, RGX_motion } from './motion'
import { ModeCommandType, RGX_mode_command_type } from './mode'

type CommandOptions = { [key: string]: any }
export type CommandType = MotionType | ModeCommandType
export interface Command {
    count?: number
    type: CommandType
    options?: CommandOptions
}

const RGX_count = /[1-9][0-9]*/

const RGX_command_type = new RegExp(RGX_motion.source + '|' + RGX_mode_command_type.source)

export const parse_command = (s: string): Command | null => {
    let count = 1
    let type: CommandType | undefined
    let options: CommandOptions | undefined

    // parse count
    const count_match = RGX_count.exec(s)
    if (count_match && count_match.index === 0) {
        count = parseInt(count_match[0])
        s = s.substring(count_match[0].length)
    }

    // parse type
    const type_match = RGX_command_type.exec(s)
    if (!type_match || type_match.index !== 0) return null

    type = type_match[0] as CommandType
    s = s.substring(type_match[0].length)

    if (type_match) return { count, type, options }
}
