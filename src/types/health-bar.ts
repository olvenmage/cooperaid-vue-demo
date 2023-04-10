export default class Healthbar {
    public current: number
    public max: number

    constructor(maxHealth: number) {
        this.max = maxHealth;
        this.current = maxHealth;
    }

    increase(amount: number) {
        this.current = Math.min(this.current + amount, this.max)
    }

    decrease(amount: number) {
        this.current = Math.max(this.current - amount, 0)
    }
}