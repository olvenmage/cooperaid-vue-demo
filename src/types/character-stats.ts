import { ref, watch } from "vue"
import type StatsState from "./state/stats-state"
import GameSettings from "@/core/settings"

export interface StatsOptionsConstructor {
    maxHealth: number,
    armor?: number,
    magicalArmor?: number
    speed?: number
    energyBoost?: number,
    crit ?: number
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

interface CoreStatsObject {
    baseHealth?: number
    dexterity: number
    strength: number
    intelligence: number
    constitution: number
}

export class CoreStats {
    public baseHealth = new CharacterStat()
    public dexterity = new CharacterStat()
    public strength = new CharacterStat()
    public intelligence = new CharacterStat()
    public constitution = new CharacterStat()

    constructor(params: CoreStatsObject) {
        this.dexterity.set(params.dexterity)
        this.strength.set(params.strength)
        this.intelligence.set(params.intelligence)
        this.constitution.set(params.constitution)
        this.baseHealth.set(params.baseHealth ?? GameSettings.baseHealth)
    }

    setDerivedStats(derivedStats: DerivedStats)  {
        derivedStats.energyRegenHaste.set(this.dexterity.value)
        derivedStats.critChance.set(GameSettings.baseCritChance + Math.floor(this.dexterity.value / 3))
        derivedStats.dodgeChance.set(Math.floor(this.dexterity.value / 3))

        derivedStats.castSpeed.set(this.strength.value)
        derivedStats.attackPower.set(Math.floor(this.strength.value / 4))

        derivedStats.magicPotency.set(this.intelligence.value)
        derivedStats.maxEnergy.set(10 + Math.floor(this.intelligence.value / 6))
        derivedStats.magicalArmor.set(Math.floor(this.intelligence.value / 6))

        derivedStats.hardiness.set(this.constitution.value)
        derivedStats.maxHealth.set(this.getMaxHealth())
        derivedStats.armor.set(Math.floor(this.constitution.value / 6))
    }

    clone() {
        return new CoreStats({
            dexterity: this.dexterity.value,
            strength: this.strength.value,
            intelligence: this.intelligence.value,
            constitution: this.constitution.value,
            baseHealth: this.baseHealth.value
        })
    }

    recalculateBasedOn(stats: CoreStats) {
        this.baseHealth.recalculate(stats.baseHealth.value)
        this.dexterity.recalculate(stats.dexterity.value)
        this.strength.recalculate(stats.strength.value)
        this.intelligence.recalculate(stats.intelligence.value)
        this.constitution.recalculate(stats.constitution.value)
    }

    getMaxHealth() {
        return this.baseHealth.value + this.constitution.value * 3
    }
}

class DerivedStats {
    energyRegenHaste = new CharacterStat()
    critChance = new CharacterStat()
    dodgeChance = new CharacterStat()

    castSpeed = new CharacterStat()
    attackPower = new CharacterStat()

    magicPotency = new CharacterStat()
    maxEnergy = new CharacterStat()
    magicalArmor = new CharacterStat()

    armor = new CharacterStat()
    maxHealth = new CharacterStat()
    hardiness = new CharacterStat()

    initiative = new CharacterStat()
}

export default class CharacterStats {
    core: CoreStats
    derived: DerivedStats
    stunned = false
    flying = false

    constructor(coreStats: CoreStats) {
        this.core = coreStats
        this.derived =  new DerivedStats()
        this.updateDerivedStats()
    }

    updateDerivedStats() {
        this.core.setDerivedStats(this.derived)
    }

    clone() {
        return new CharacterStats(
            this.core.clone()
        )
    }

    recalculateBasedOn(stats: CharacterStats) {
        this.core.recalculateBasedOn(stats.core)
        this.updateDerivedStats()
        this.stunned = false
        this.flying = false
    }

    getState(): StatsState {
        return {
            maxHealth: this.derived.maxHealth.value,
            armor: this.derived.armor.value,
            magicalArmor: this.derived.magicalArmor.value,
            energyBoost: this.derived.energyRegenHaste.value,
            speed: this.derived.castSpeed.value,
            stunned: this.stunned,
            flying: this.flying
        }
    }
}