export const key_event_key_to_char = (key: string): string => {
    if (key.length === 1) return key
    switch (key) {
        case 'Enter':
            return '\n'
        case 'Tab':
            return '\t'
        case 'Space':
            return ' '
        case 'Backspace':
            return '\b'
        default:
            return ''
    }
}

/**
 * Delete [start, end] in s and return the result
 * @param start: inclusive
 * @param end: inclusive
 */
export const string_delete = (s: string, i: number, j: number): string => {
    const start = Math.min(i, j)
    const end = Math.max(i, j)
    return s.slice(0, start) + s.slice(end + 1)
}

export const string_insert = (s: string, to_add: string, start: number): string => {
    return s.slice(0, start) + to_add + s.slice(start)
}

export const last_char = (s: string) => s.charAt(s.length - 1)
