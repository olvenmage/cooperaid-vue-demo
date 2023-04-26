import type Character from "../character"
import type DamageType from "../damage-type"

export default interface BeforeDealDamageTrigger {
    id: string
    damage: number
    damageType: DamageType,
    threatModifier: number,
    isCrit: boolean
    damagedBy: Character|null
}