import Cursor from './cursor'

enum Mode {
    Normal,
    Insert,
    Visual,
    VisualLine,
    VisualBlock,
    Replace,
    Command,
}

const KEY_REPEAT_DELAY_MS = 200
const KEY_REPEAT_INTERVAL_MS = 50

class Vim {
    textarea: HTMLTextAreaElement
    text: string = ''
    mode: Mode = Mode.Normal
    cursor: Cursor
    selectionStart: number = 0
    selectionEnd: number = 0
    // keys
    isKeyDown: boolean = false
    delayTimer: NodeJS.Timeout | null = null
    timerUntilRepeat: NodeJS.Timeout | null = null
    command: string = ''

    constructor(textarea: HTMLTextAreaElement) {
        this.text = textarea.value
        this.textarea = textarea
        this.cursor = new Cursor(this)
        this.update.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
        textarea.addEventListener('keydown', (e) => {
            e.preventDefault()
            this.handleKeyDown(e.key)
        })
        textarea.addEventListener('keyup', (e) => {
            e.preventDefault()
            this.handleKeyUp(e.key)
        })
        textarea.addEventListener('click', (e) => {
            e.preventDefault()
            textarea.setSelectionRange(this.cursor.pos, this.cursor.pos)
        })
    }

    isCommand(cmd: string) {
        return (
            // general movement
            /([1-9][0-9]*)?[hjklwWeEbB]/.test(cmd) ||
            // special movement
            /0|\^|\$|%/.test(cmd) ||
            // goto
            /([1-9][0-9]*)?(G|gg)/.test(cmd)
        )
    }

    update() {
        if (!this.isCommand(this.command)) return
        switch (this.mode) {
            case Mode.Normal:
                this.updateNormal()
                break
            case Mode.Insert:
            case Mode.Visual:
            case Mode.VisualLine:
            case Mode.VisualBlock:
            case Mode.Replace:
            case Mode.Command:
                break
        }
        if (!this.isKeyDown) this.command = ''
    }

    updateNormal() {
        // movement
        const [_, numStr, cmd] = this.command.match(/([1-9][0-9]*)?(.*)/) || []
        const shouldRepeat = !/gg|G|yy/.test(cmd)
        const num = numStr ? parseInt(numStr) : -1
        const repeat = shouldRepeat && num !== -1 ? num : 1
        console.log('updateNormal command:', cmd, 'repeat:', repeat)
        for (let i = 0; i < repeat; i++) {
            switch (cmd) {
                case 'h':
                    this.cursor.moveLeft()
                    break
                case 'j':
                    this.cursor.moveDown()
                    break
                case 'k':
                    this.cursor.moveUp()
                    break
                case 'l':
                    this.cursor.moveRight()
                    break
                case 'w':
                    this.cursor.moveNextWord()
                    break
                case 'W':
                    this.cursor.moveNextWord(false)
                    break
                case 'e':
                    this.cursor.moveNextEndOfWord()
                    break
                case 'E':
                    this.cursor.moveNextEndOfWord(false)
                    break
                case 'b':
                    this.cursor.movePrevStartOfWord()
                    break
                case 'B':
                    this.cursor.movePrevStartOfWord(false)
                    break
                case '0':
                    this.cursor.moveToStartOfLine()
                    break
                case '_':
                case '^':
                    this.cursor.moveToFirstNonBlank()
                    break
                case '$':
                    this.cursor.moveToEndOfLine()
                    break
                case 'G':
                    this.cursor.moveToLine(num)
                    break
                case 'gg':
                    this.cursor.moveToLine(num === -1 ? 0 : num - 1)
                    break
            }
        }
        console.log('row', this.cursor.row, 'col', this.cursor.col, 'pos', this.cursor.pos)
    }

    handleKeyDown(key: string) {
        if (this.isKeyDown || key === 'Shift') return

        this.isKeyDown = true
        this.command += key
        this.delayTimer = setTimeout(() => {
            this.timerUntilRepeat = setInterval(() => {
                this.update()
            }, KEY_REPEAT_INTERVAL_MS)
        }, KEY_REPEAT_DELAY_MS)
        this.update()
    }
    handleKeyUp(key: string) {
        //console.log('keyup', key)
        if (!this.isKeyDown) return

        this.isKeyDown = false
        if (this.delayTimer) clearTimeout(this.delayTimer)
        if (this.timerUntilRepeat) clearInterval(this.timerUntilRepeat)
    }
}

export default Vim
