import GameSettings from '@/core/settings';
import type Character from './character';
import type { CharacterSkill, CharacterSkillTargetType } from './state/character-state';
import DamageType from './damage-type';
import type OnDamageTrigger from './triggers/on-damage-trigger';
import { AiTargetting, TargetType } from './skill';

export interface SkillDataParams {
    name: string,
    energyCost: number,
    cooldown: number,
    imagePath: string|null,
    castTime: number,
    targetType: TargetType
    aiTargetting?: AiTargetting,
    interuptsOnDamageTaken?: boolean
    castingIncrementer?: number
    canCastOnCooldown?: boolean
}

export default class SkillData {
    name: string
    energyCost: number
    // cooldown in microseconds
    cooldown: number
    targetType: TargetType

    public imagePath: string|null
    public aiTargetting
    // cast time in microseconds
    castTime: number

    public interuptsOnDamageTaken

    public castingIncrementer

    currentParams: SkillDataParams
    isTransformed = false
    oldData: SkillDataParams|null = null
    canCastOnCooldown

    get timeRelativeCooldown() {
        return this.cooldown / GameSettings.speedFactor
    }

    constructor(params: SkillDataParams) {
        this.currentParams = params
        this.name = params.name
        this.energyCost = params.energyCost
        this.cooldown = params.cooldown
        this.targetType = params.targetType
        this.imagePath = params.imagePath
        this.aiTargetting = params.aiTargetting ?? AiTargetting.HIGHEST_THREAT
        this.castTime=  params.castTime
        this.interuptsOnDamageTaken = params.interuptsOnDamageTaken ?? false
        this.castingIncrementer = params.castingIncrementer ?? 100
        this.canCastOnCooldown = params.canCastOnCooldown ?? false
    }

    transform(newParams: Partial<SkillDataParams>) {
        if (this.isTransformed) return;

        const params = Object.assign({}, this.currentParams, newParams)

        this.oldData = this.currentParams;
        this.currentParams = params
        this.name = params.name
        this.energyCost = params.energyCost
        this.cooldown = params.cooldown
        this.targetType = params.targetType
        this.imagePath = params.imagePath
        this.aiTargetting = params.aiTargetting ?? AiTargetting.HIGHEST_THREAT
        this.castTime=  params.castTime
        this.interuptsOnDamageTaken = params.interuptsOnDamageTaken ?? false
        this.castingIncrementer = params.castingIncrementer ?? 100
        this.canCastOnCooldown = newParams.canCastOnCooldown ?? false
        this.isTransformed = true
    }

    transformBack() {
        if (!this.oldData || !this.isTransformed) {
            console.log("cant sorry")
            return false
        }

        this.isTransformed = false;

        console.log("transforming back into")
        console.log(this.oldData)
        this.transform(this.oldData)
        this.oldData = null
        this.isTransformed = false;
    }

    clone(): SkillData {
        return new SkillData(this.currentParams)
    }
}