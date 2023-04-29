import GameSettings from '@/core/settings';
import type Character from './character';
import type { CharacterSkill, CharacterSkillTargetType } from './state/character-state';
import type DamageType from './damage-type';
import type OnDamageTrigger from './triggers/on-damage-trigger';
import { AiTargetting, SkillTag, TargetType, SkillRange } from './skill';

export interface SkillDataParams {
    name: string,
    energyCost: number,
    cooldown: number,
    imagePath: string|null,
    castTime: number,
    range: SkillRange,
    targetType: TargetType
    aiTargetting?: AiTargetting,
    interuptsOnDamageTaken?: boolean
    castingIncrementer?: number
    canCastOnCooldown?: boolean
    damage?: number
    healing?: number
    damageType: DamageType
    buffDuration?: number
    maxStacks?: number,
    extraCrit?: number,
    tags?: SkillTag[]
}

export default class SkillData {
    name: string
    energyCost: number
    // cooldown in microseconds
    cooldown: number
    targetType: TargetType

    imagePath: string|null
    aiTargetting
    // cast time in microseconds
    castTime: number
    extraCrit: number

    interuptsOnDamageTaken

    castingIncrementer
    canCastOnCooldown
    damage: number = 0
    healing: number = 0
    buffDuration: number
    maxStacks: number
    damageType: DamageType
    tags: SkillTag[]
    range: SkillRange


    private baseParams: SkillDataParams
    private currentBaseParams: SkillDataParams
    private currentParams: SkillDataParams
    isTransformed = false
    private oldData: SkillDataParams|null = null

    get timeRelativeCooldown() {
        return this.cooldown / GameSettings.speedFactor
    }

    constructor(params: SkillDataParams) {
        this.currentParams = params
        this.baseParams = params
        this.currentBaseParams = params

        this.tags = params.tags ?? []
        this.range = params.range
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
        this.damage = params.damage ?? 0
        this.healing = params.healing ?? 0
        this.damageType = params.damageType ?? null
        this.buffDuration = params.buffDuration ?? 0
        this.maxStacks = params.maxStacks ?? 0
        this.extraCrit = params.extraCrit ?? 0
    }

    resetToBase() {
        this.applyParams(Object.assign({}, this.currentBaseParams))
    }

    transform(newParams: Partial<SkillDataParams>) {
        if (this.isTransformed) return;

        const params = Object.assign({}, this.currentParams, newParams)

        this.applyParams(params)

        this.oldData = this.currentParams;
        this.currentBaseParams = params
        this.currentParams = params
       
        this.isTransformed = true
    }

    transformBack() {
        if (!this.oldData || !this.isTransformed) {
            return false
        }

        this.isTransformed = false;

        this.transform(this.oldData)
        this.oldData = null
        this.currentBaseParams = this.baseParams
        this.isTransformed = false;
    }

    private applyParams(params: SkillDataParams) {
        this.name = params.name
        this.range = params.range
        this.tags = params.tags ?? []
        this.energyCost = params.energyCost
        this.cooldown = params.cooldown
        this.targetType = params.targetType
        this.imagePath = params.imagePath
        this.aiTargetting = params.aiTargetting ?? AiTargetting.HIGHEST_THREAT
        this.castTime=  params.castTime
        this.interuptsOnDamageTaken = params.interuptsOnDamageTaken ?? false
        this.castingIncrementer = params.castingIncrementer ?? 100
        this.canCastOnCooldown = params.canCastOnCooldown ?? false
        this.damage = params.damage ?? 0
        this.healing = params.healing ?? 0
        this.damageType = params.damageType ?? null
        this.buffDuration = params.buffDuration ?? 0
        this.maxStacks = params.maxStacks ?? 0
        this.extraCrit = params.extraCrit ?? 0
    }

    clone(): SkillData {
        const newSkillData = new SkillData(this.baseParams)

        if (this.isTransformed) {
            newSkillData.transform(this.currentParams)
        }

        return newSkillData
    }
}