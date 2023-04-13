import type Character from "./character";
import type DamageType from "./damage-type";

export interface TakeDamageParams {
    amount: number,
    minAmount?: number,
    type: DamageType,
    damagedBy: Character,
    threatModifier?: number
}

export interface DealDamageToParams {
    amount: number,
    minAmount?: number,
    type: DamageType,
    target: Character,
    threatModifier?: number
}