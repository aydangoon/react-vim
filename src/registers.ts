type RegisterValue = { value: string; linewise: boolean } | undefined
class Registers {
    private readonly registers: { [key: string]: RegisterValue } = {
        '"': undefined, // default register
        '0': undefined, // yank register
        '1': undefined, // delete register
        '2': undefined,
        '3': undefined,
        '4': undefined,
        '5': undefined,
        '6': undefined,
        '7': undefined,
        '8': undefined,
        '9': undefined,
        _: undefined, // black hole register
    }

    public put_delete(value: string, linewise: boolean) {
        this.registers['"'] = { value, linewise }
        let prev = this.registers['1']
        this.registers['1'] = { value, linewise }
        for (let i = 2; i < 9; i++) {
            const temp = this.registers[i.toString()]
            this.registers[i.toString()] = prev
            prev = temp
        }
    }

    public put_yank(value: string, linewise: boolean) {
        this.registers['"'] = { value, linewise }
        this.registers['0'] = { value, linewise }
    }

    public get(key: string | number) {
        if (typeof key === 'number') {
            key = key.toString()
        }
        return this.registers[key]
    }
}

export default Registers
