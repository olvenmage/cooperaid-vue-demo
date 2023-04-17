import { ref, watch } from "vue"
import type StatsState from "./state/stats-state"

export interface StatsOptionsConstructor {
    maxHealth: number,
    armor?: number,
    magicalArmor?: number
    speed?: number
    energyBoost?: number
}

class CharacterStat {
    private innerVal = 0
    private onChangedCallbacks: ((value: number, oldValue: number) => void)[] = []

    get value() {
        return this.innerVal
    }


    set(newValue: number) {
        this.onChangedCallbacks.forEach((cb) => cb(newValue, this.innerVal))
        this.innerVal = newValue
    }

    recalculate(value: number) {
        this.onChangedCallbacks = []
        this.innerVal = value
    }

    onChange(callback: (value: number, oldValue: number) => void) {
        this.onChangedCallbacks.push(callback)
    }
}

export default class CharacterStats {
    public maxHealth = new CharacterStat()
    public armor = new CharacterStat()
    public magicalArmor = new CharacterStat()
    public energyBoost = new CharacterStat()
    public speed = new CharacterStat()
    public stunned = false

    constructor(maxHealth: number, armor = 0, magicalArmor = 0, energyBoost = 0, speed = 0) {
        this.maxHealth.set(maxHealth)
        this.armor.set(armor)
        this.magicalArmor.set(magicalArmor)
        this.energyBoost.set(energyBoost)
        this.speed.set(speed)
    }

    static fromObject(object: StatsOptionsConstructor) {
        return new CharacterStats(
            object.maxHealth || 0,
            object.armor || 0,
            object.magicalArmor || 0,
            object.energyBoost || 0,
            object.speed || 0
        )
    }

    clone() {
        return new CharacterStats(
            this.maxHealth.value,
            this.armor.value,
            this.magicalArmor.value,
            this.energyBoost.value,
            this.speed.value
        )
    }

    recalculateBasedOn(stats: CharacterStats) {
        this.armor.recalculate(stats.armor.value)
        this.magicalArmor.recalculate(stats.magicalArmor.value)
        this.maxHealth.recalculate(stats.maxHealth.value)
        this.energyBoost.recalculate(stats.energyBoost.value)
        this.speed.recalculate(stats.speed.value)
        this.stunned = false
    }

    getState(): StatsState {
        return {
            maxHealth: this.maxHealth.value,
            armor: this.armor.value,
            magicalArmor: this.magicalArmor.value,
            energyBoost: this.energyBoost.value,
            speed: this.speed.value,
            stunned: this.stunned,
        }
    }
}