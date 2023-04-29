import GameSettings from "@/core/settings"
import type Character from "./character"
import type CharacterStats from "./character-stats"

export default abstract class ClassBar {
    public current: number
    public max: number
    public color: string
    public activated = false
    public onFilled: (() => void)|null = null

    onActivedCallbacks: (() => void)[] = []

    abstract tickConsumeAmount: number
    abstract tickInterval: number

    abstract tickEffect(character: Character, consumeEffectiveness: number): void

    constructor(maxResource: number, color: string) {
        this.max = maxResource;
        this.current = 0;
        this.color = color
    }
    
    get tickIntervalSpeedRelative() {
        return this.tickInterval / GameSettings.speedFactor
    }

    increase(amount: number) {
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

    activate(character: Character) {
        if (this.activated) {
            return
        }
        this.activated = true;
        this.onActivedCallbacks.forEach((cb) => cb())

        this.onActivatedStart(character)
        this.activeTick(character)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        return stats
    }

    onActivatedStart(character: Character) {
        return
    }

    onActivatedEnd(character: Character) {
        return
    }

    private activeTick(character: Character) {
        const consumedAmount = Math.min(this.tickConsumeAmount, this.current)
        this.decrease(consumedAmount)
        const consumeEffectiveness = (this.tickConsumeAmount / consumedAmount)

        this.tickEffect(character, consumeEffectiveness)

        if (this.current <= 0) {
            this.activated = false
            this.onActivedCallbacks.forEach((cb) => cb())
            this.onActivatedEnd(character)
            return
        }

        setTimeout(() => {
            this.activeTick(character)
        }, this.tickIntervalSpeedRelative);
    }
}