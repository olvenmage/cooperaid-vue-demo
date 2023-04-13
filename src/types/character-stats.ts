import { ref, watch } from "vue"

export interface StatsOptionsConstructor {
    maxHealth: number,
    armor?: number,
    magicalArmor?: number
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
    public stunned = false

    constructor(maxHealth: number, armor = 0, magicalArmor = 0) {
        this.maxHealth.set(maxHealth)
        this.armor.set(armor)
        this.magicalArmor.set(magicalArmor)
    }

    static fromObject(object: StatsOptionsConstructor) {
        return new CharacterStats(
            object.maxHealth || 0,
            object.armor || 0,
            object.magicalArmor || 0
        )
    }

    clone() {
        return new CharacterStats(
            this.maxHealth.value,
            this.armor.value,
            this.magicalArmor.value,
            this.stunned
        )
    }

    recalculateBasedOn(stats: CharacterStats) {
        this.armor.recalculate(stats.armor.value)
        this.magicalArmor.recalculate(stats.magicalArmor.value)
        this.maxHealth.recalculate(stats.maxHealth.value)
        this.stunned = false
    }
}