import type Character from "../character"
import type DamageType from "../damage-type"

export default interface OnDamageTrigger {
    character: Character
    originalDamage: number
    actualDamage: number,
    damageType: DamageType,
    threatModifier: number,
    damagedBy: Character|null
}