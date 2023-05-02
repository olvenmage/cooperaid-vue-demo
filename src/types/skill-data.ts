import GameSettings from '@/core/settings';
import type Character from './character';
import type { CharacterSkill, CharacterSkillTargetType } from './state/character-state';
import type DamageType from './damage-type';
import type OnDamageTrigger from './triggers/on-damage-trigger';
import { AiTargetting, SkillTag, TargetType, SkillRange } from './skill';
import type { CoreStats, StatType } from './character-stats';
import CharacterStats from './character-stats';

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
    damage?: DynamicSkillDataValue
    healing?: DynamicSkillDataValue
    damageType: DamageType
    buffDuration?: number
    maxStacks?: number,
    extraCrit?: number,
    tags?: SkillTag[],
    strengthDamageModifier?: number
    intelligenceDamageModifier?: number
    dexterityDamageModifier?: number
    constitutionDamageModifier?: number
}

export class DynamicSkillDataValue {
    private initialValue: number

    private baseStatModifiers : Record<StatType, number> = {
        armor: 0,
        dexterity: 0,
        constitution: 0,
        strength: 0,
        intelligence: 0,
        no_type: 0,
    }

    public statModifiers: Record<StatType, number> = {
        armor: 0,
        dexterity: 0,
        constitution: 0,
        strength: 0,
        intelligence: 0,
        no_type: 0,
    }

    constructor(public value: number = 0) {
        this.initialValue = value
    }

    private getAppliedValue(statType: StatType, stats: CharacterStats) {
        const modifier = this.statModifiers[statType as StatType]

        if (statType === 'armor') {
            const armor = stats.derived.armor.value * modifier

            return armor
        } else if (statType == 'no_type') {
            return 0
        } else {
            // is goed or
            return stats.core[statType as StatType].value * modifier
        }
    }

    applyStats(stats: CharacterStats) {
        let modifiedValue = this.initialValue

       
        for (const statType in this.statModifiers) {
           modifiedValue += this.getAppliedValue(statType as StatType, stats)
        }

        this.value = modifiedValue
    }

    resetToBase() {
        this.statModifiers = {
            dexterity: this.baseStatModifiers.dexterity,
            strength: this.baseStatModifiers.strength,
            armor: this.baseStatModifiers.armor,
            constitution: this.baseStatModifiers.constitution, 
            intelligence: this.baseStatModifiers.intelligence,
            no_type: this.baseStatModifiers.no_type
        }

    }

    increaseInitialValue(num: number) {
        this.initialValue += num
    }

    modifiedBaseBy(stat: StatType, modifer: number) {
        this.baseStatModifiers[stat] += modifer
        this.statModifiers[stat] += modifer
        return this
    }

    modifiedBy(stat: StatType, modifer: number) {
        this.statModifiers[stat] += modifer
        return this
    }

    clone() {
        const cloned = new DynamicSkillDataValue(this.value)

        cloned.statModifiers = Object.assign({}, this.statModifiers)

        return cloned
    }

    getFormulaText(castBy: Character|null): string {
        let amount = this.initialValue

        let text = "";

        if (amount != 0) {
            text = `${this.initialValue}`
        }

        for (const statType in this.statModifiers) {
            const modifier = this.statModifiers[statType as StatType]

            if (modifier > 0) {
                if (castBy) {
                    const formatted = Math.round(this.getAppliedValue(statType as StatType, castBy.stats))
                    amount += formatted

                    text += ` <span class="${statType}-color">(+${formatted}) [${modifier * 100}%]</span>`
                } else {
                    text += ` +${modifier * 100}% ${statType}`
                }
            }
        }

        text += ` = ${amount}`

        return text
    }
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
    damage: DynamicSkillDataValue
    healing: DynamicSkillDataValue
    buffDuration: number
    maxStacks: number
    damageType: DamageType
    tags: SkillTag[]
    range: SkillRange

    strengthDamageModifier: number = 0
    intelligenceDamageModifier: number = 0
    dexterityDamageModifier: number = 0
    constitutionDamageModifier: number = 0

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
        this.damage = params.damage ?? new DynamicSkillDataValue(0)
        this.healing = params.healing ?? new DynamicSkillDataValue(0)
        this.damageType = params.damageType ?? null
        this.buffDuration = params.buffDuration ?? 0
        this.maxStacks = params.maxStacks ?? 0
        this.extraCrit = params.extraCrit ?? 0
        this.strengthDamageModifier = params.strengthDamageModifier ?? 0
        this.intelligenceDamageModifier = params.intelligenceDamageModifier ?? 0
        this.dexterityDamageModifier = params.dexterityDamageModifier ?? 0
        this.constitutionDamageModifier = params.constitutionDamageModifier ?? 0
    }

    resetToBase() {
        this.applyParams(Object.assign({}, this.currentBaseParams))
        this.damage.resetToBase()
        this.healing.resetToBase()
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
        this.damage = params.damage ?? new DynamicSkillDataValue(0)
        this.healing = params.healing ?? new DynamicSkillDataValue(0)
        this.damageType = params.damageType ?? null
        this.buffDuration = params.buffDuration ?? 0
        this.maxStacks = params.maxStacks ?? 0
        this.extraCrit = params.extraCrit ?? 0
        this.strengthDamageModifier = params.strengthDamageModifier ?? 0
        this.intelligenceDamageModifier = params.intelligenceDamageModifier ?? 0
        this.dexterityDamageModifier = params.dexterityDamageModifier ?? 0
        this.constitutionDamageModifier = params.constitutionDamageModifier ?? 0
    }

    clone(): SkillData {
        const newSkillData = new SkillData(this.baseParams)
        newSkillData.damage = this.baseParams.damage?.clone() ?? new DynamicSkillDataValue(0)
        newSkillData.healing = this.baseParams.healing?.clone() ?? new DynamicSkillDataValue(0)

        if (this.isTransformed) {
            newSkillData.transform(this.currentParams)
        }

        return newSkillData
    }
}