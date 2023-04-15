export enum CharacterSkillTargetType {
    TARGET_ENEMY,
    TARGET_FRIENDLY,
    TARGET_NONE,
    TARGET_ANY,
    TARGET_ALL_ENEMIES
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
    buffs: CharacterBuff[]
    stats: {
        armor: number,
        magicalArmor: number
        stunned: boolean
    }
    dead: boolean
}

export interface CharacterSkill {
    name: string,
    imagePath: string|null,
    canCast: boolean,
    energyCost: number,
    validTargets: string[],
    targetType: CharacterSkillTargetType
}

export interface CharacterBuff {
    name: string,
    duration: number,
    positive: boolean
}