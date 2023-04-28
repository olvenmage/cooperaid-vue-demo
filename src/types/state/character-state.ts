import type StatsState from "./stats-state"
import type UpgradeGemState from "./upgrade-gem-state"

export enum CharacterSkillTargetType {
    TARGET_ENEMY,
    TARGET_FRIENDLY,
    TARGET_NONE,
    TARGET_SELF,
    TARGET_ANY,
    TARGET_ALL_ENEMIES,
    TARGET_ALL_FRIENDLIES
}

export default interface CharacterState {
    id: string
    healthBar: {
        current: number,
        max: number
    }
    energyBar: {
        current: number,
        max: number
    }
    imagePath: string|null,
    specialBar: {
        current: number
        max: number
        color: string
        active: boolean
    }|null
    basicSkill: CharacterSkill|null
    skills: CharacterSkill[]
    buffs: BuffState[]
    stats: StatsState
    dead: boolean
    highestThreatId: string|null
}

export interface CharacterSkill {
    id: string
    name: string,
    description: string|null,
    imagePath: string|null,
    canCast: boolean,
    energyCost: number,
    validTargets: string[],
    targetType: CharacterSkillTargetType
    socketedGem: UpgradeGemState|null
    cooldownRemaining: number // in ms speed relative,
    cooldown: string // in ms speed relative
    buffDuration: number // in ms speed relative
    castTime: number // in ms speed relative
}

export interface BuffState {
    name: string,
    durationLeft: number,
    positive: boolean
    imagePath: string|null
    showDuration: boolean
}