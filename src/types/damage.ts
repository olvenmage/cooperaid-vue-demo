import type Character from "./character";
import type DamageSchool from "./damage-school";
import type DamageType from "./damage-type";

export interface TakeDamageParams {
    amount: number,
    minAmount?: number,
    type: DamageType,
    damagedBy: Character,
    isCrit?: boolean,
    isDodged?: boolean,
    threatModifier?: number
}

export interface DealDamageToParams {
    amount: number,
    minAmount?: number,
    type: DamageType,
    school?: DamageSchool
    targets: Character[],
    threatModifier?: number,
    noCrit?: boolean
}