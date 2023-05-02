import { ref, watch } from "vue"
import type StatsState from "./state/stats-state"
import GameSettings from "@/core/settings"
import type { CorePlayerStatsState, DerivedStatsState } from "./state/player-stats-state"

export interface StatsOptionsConstructor {
    maxHealth: number,
    armor?: number,
    magicalArmor?: number
    speed?: number
    energyBoost?: number,
    crit ?: number
}

export type StatType = 'dexterity'|'constitution'|'intelligence'|'strength'|'armor'|'no_type'

class CharacterStat {
    private innerVal = 0
    private onChangedCallbacks: ((value: number, oldValue: number) => void)[] = []

    constructor(public type: StatType) {

    }

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
    baseCrit?: number
    isPlayer?: boolean
}

export class CoreStats {
    public baseHealth = new CharacterStat('no_type')
    public dexterity = new CharacterStat('dexterity')
    public strength = new CharacterStat('strength')
    public intelligence = new CharacterStat('intelligence')
    public constitution = new CharacterStat('constitution')
    public baseCrit = new CharacterStat('no_type')

    isPlayer: boolean

    constructor(params: CoreStatsObject) {
        this.dexterity.set(params.dexterity)
        this.strength.set(params.strength)
        this.intelligence.set(params.intelligence)
        this.constitution.set(params.constitution)
        this.baseHealth.set(params.baseHealth ?? GameSettings.baseHealth)
        this.baseCrit.set(params.baseCrit ?? GameSettings.baseMonsterCritChance)
        this.isPlayer = params.isPlayer ?? false
    }

    setDerivedStats(derivedStats: DerivedStats)  {
        derivedStats.energyRegenHaste.set(this.dexterity.value * GameSettings.derivedStatsOptions.eneryRegenPerDex)
        derivedStats.critChance.set(this.baseCrit.value + Math.floor(this.dexterity.value / GameSettings.derivedStatsOptions.dexPerCrit))
        // derivedStats.dodgeChance.set(Math.floor(this.dexterity.value / GameSettings.derivedStatsOptions.dexPerDodge))

        derivedStats.castSpeed.set(this.strength.value * GameSettings.derivedStatsOptions.castSpeedIncreasePerStr)
        derivedStats.attackDamage.set(Math.floor(this.strength.value / GameSettings.derivedStatsOptions.attackDamagePerStrength))

        derivedStats.cooldownReduction.set(this.intelligence.value * GameSettings.derivedStatsOptions.cooldownReductionPerInt)
        derivedStats.maxEnergy.set(10 + Math.floor(this.intelligence.value / GameSettings.derivedStatsOptions.intPerMaxEnergyIncrease))
        derivedStats.magicalArmor.set(Math.floor(this.intelligence.value / GameSettings.derivedStatsOptions.intPerMagicArmor))

        derivedStats.hardiness.set(this.constitution.value * GameSettings.derivedStatsOptions.hardinessPerConst)
        derivedStats.maxHealth.set(this.getMaxHealth())
        derivedStats.armor.set(Math.floor(this.constitution.value / GameSettings.derivedStatsOptions.constPerArmor))
    }

    clone() {
        return new CoreStats({
            baseCrit: this.baseCrit.value,
            dexterity: this.dexterity.value,
            strength: this.strength.value,
            intelligence: this.intelligence.value,
            constitution: this.constitution.value,
            baseHealth: this.baseHealth.value,
            isPlayer: this.isPlayer,
        })
    }

    getHighest(): CharacterStat {
        const stats = [this.dexterity, this.strength, this.constitution, this.intelligence]

        return stats.sort((s1, s2) => Math.sign(s2.value - s1.value))[0]
    }

    recalculateBasedOn(stats: CoreStats) {
        this.baseHealth.recalculate(stats.baseHealth.value)
        this.dexterity.recalculate(stats.dexterity.value)
        this.strength.recalculate(stats.strength.value)
        this.intelligence.recalculate(stats.intelligence.value)
        this.constitution.recalculate(stats.constitution.value)
        this.baseCrit.recalculate(stats.baseCrit.value)
    }

    getMaxHealth() {
        let maxHealth = this.baseHealth.value + this.constitution.value * GameSettings.derivedStatsOptions.maxHealthPerConst

        if (!this.isPlayer) {
            maxHealth = Math.round(maxHealth * GameSettings.extraEnemyHealthModifier)
        }

        return maxHealth
    }

    getState(): CorePlayerStatsState {
        return {
            baseCrit: this.baseCrit.value,
            dexterity: this.dexterity.value,
            constitution: this.constitution.value,
            strength: this.strength.value,
            intelligence: this.intelligence.value
        }
    }
}

class DerivedStats {
    energyRegenHaste = new CharacterStat('no_type')
    critChance = new CharacterStat('no_type')
    dodgeChance = new CharacterStat('no_type')

    castSpeed = new CharacterStat('no_type')
    attackDamage = new CharacterStat('no_type')

    cooldownReduction = new CharacterStat('no_type')
    maxEnergy = new CharacterStat('no_type')
    magicalArmor = new CharacterStat('no_type')

    armor = new CharacterStat('armor')
    maxHealth = new CharacterStat('no_type')
    hardiness = new CharacterStat('no_type')

    initiative = new CharacterStat('no_type')

    getState(): DerivedStatsState {
        return {
            energyRegenHaste: this.energyRegenHaste.value,
            critChance: this.critChance.value,
            dodgeChance: this.dodgeChance.value,

            castSpeed: this.castSpeed.value,
            attackDamage: this.attackDamage.value,

            cooldownReduction: this.cooldownReduction.value,
            maxEnergy: this.maxEnergy.value,
            magicalArmor: this.magicalArmor.value,

            armor: this.armor.value,
            maxHealth: this.maxHealth.value,
            hardiness: this.hardiness.value
        }
    }
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