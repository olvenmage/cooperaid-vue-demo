export default class Healthbar {
    public current: number
    public max: number

    constructor(maxHealth: number) {
        this.max = maxHealth;
        this.current = maxHealth;
    }

    increase(amount: number): number {
        if (typeof amount == 'undefined') {
            return 0
        }

        const oldAMount = this.current
        this.current = Math.min(this.current + amount, this.max)

        return this.current - oldAMount
    }

    decrease(amount: number) {
        this.current -= amount
    }
}