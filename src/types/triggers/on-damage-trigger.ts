import type Character from "../character"
import type DamageSchool from "../damage-school"
import type DamageType from "../damage-type"

export default interface OnDamageTrigger {
    id: string
    character: Character
    originalDamage: number
    actualDamage: number,
    damageType: DamageType,
    school?: DamageSchool
    threatModifier: number,
    isCrit: boolean
    isDodged?: boolean
    damagedBy: Character|null
}