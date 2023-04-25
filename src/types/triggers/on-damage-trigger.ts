import type Character from "../character"
import type DamageType from "../damage-type"

export default interface OnDamageTrigger {
    id: string
    character: Character
    originalDamage: number
    actualDamage: number,
    damageType: DamageType,
    threatModifier: number,
    isCrit: boolean
    damagedBy: Character|null
}