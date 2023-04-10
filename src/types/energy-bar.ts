export default class EnergyBar {
    public current: number
    public max: number

    constructor(maxEnergy: number) {
        this.max = maxEnergy;
        this.current = 0;
    }

    increase(amount: number) {
        if (this.current < this.max) {
            this.current += amount;
        }
    }
}