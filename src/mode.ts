export enum Mode {
    Normal = '-- NORMAL --',
    Insert = '-- INSERT --',
    Visual = '-- VISUAL --',
    VisualLine = '-- VISUAL LINE --',
    VisualBlock = '-- VISUAL BLOCK --',
    Replace = '-- REPLACE --',
    CommandLine = '-- COMMAND LINE --',
}

export const MODE_COMMAND_TYPES = ['i', 'v', 'R'] as const
export type ModeCommandType = (typeof MODE_COMMAND_TYPES)[number]

export const RGX_mode_command_type = new RegExp(MODE_COMMAND_TYPES.join('|'))

export const switch_mode = (curr: Mode, cmd: ModeCommandType): Mode => {
    switch (cmd) {
        case 'i':
            return Mode.Insert
        case 'v':
            return curr === Mode.Visual ? Mode.Normal : Mode.Visual
        case 'R':
            return Mode.Replace
        default:
            return Mode.Normal
    }
}
