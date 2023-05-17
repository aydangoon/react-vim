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
