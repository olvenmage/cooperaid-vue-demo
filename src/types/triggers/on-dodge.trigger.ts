import type Character from "../character"
import type DamageType from "../damage-type"

export default interface OnDodgeTrigger {
    attackedBy: Character
}