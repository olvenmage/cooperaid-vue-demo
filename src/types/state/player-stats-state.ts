import type StatConfigState from "./stat-config-state"

export interface CorePlayerStatsState {
    baseCrit: number
    dexterity: number
    constitution: number
    strength: number
    intelligence: number
}

export interface DerivedStatsState {
    dodgeChance: number
    critChance: number
    energyRegenHaste: number

    hardiness: number
    maxHealth: number
    armor: number

    castSpeed: number
    attackDamage: number

    cooldownReduction: number
    magicalArmor: number
    maxEnergy: number
}

export default interface PlayerStatsState {
    core: CorePlayerStatsState,
    derived: DerivedStatsState,
    config: StatConfigState,
    statPoints: number
}
