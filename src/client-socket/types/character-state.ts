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
    specialBar: {
        current: number
        max: number
        active: boolean
    }
    basicSkill: CharacterSkill
    skills: CharacterSkill[]
    buffs: CharacterBuff[]
    stats: {
        armor: number,
        magicalArmor: number
    }
}

interface CharacterSkill {
    name: string,
    imagePath: string|null,
    canCast: boolean,
    energyCost: number,
    validTargets: string[]
}

interface CharacterBuff {
    name: string,
    duration: number,
    positive: boolean
}

export {
    CharacterSkill,
    CharacterBuff
}