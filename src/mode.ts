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
