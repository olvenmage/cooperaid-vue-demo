import type Character from "./character"

export default class ClassBar {
    public current: number
    public max: number
    public color: string
    public activated = false
    public onFilled: (() => void)|null = null

    constructor(maxResource: number, color: string) {
        this.max = maxResource;
        this.current = 0;
        this.color = color
    }

    increase(amount: number) {
        // if (this.activated) {
        //     return
        // }

        this.current = Math.min(this.current + amount, this.max);

        if (this.isFull() && this.onFilled) {
            this.onFilled()
        }
    }

    decrease(amount: number) {
        this.current = Math.max(this.current - amount, 0);
    }

    isFull() {
        return this.current >= this.max
    }
}