import type Buff from "../buff"
import type Character from "../character"
import type DamageType from "../damage-type"

export default interface OnBuffReceivedTrigger {
    buff: Buff
}