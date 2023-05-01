import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import type OnDodgeTrigger from '../triggers/on-dodge.trigger';

interface EvasionBuffParams {
    duration: number
    speedsUpOnHit: boolean
}

export default class EvasionBuff extends Buff implements StatMutatingBuff {
    duration: number = 4 * 1000
    priority = BuffPriority.LAST_1

    public imagePath: string | null = "/skills/rogue/evasion.png"

    ARMOR_VALUE = 8

    triggered = false

    params: EvasionBuffParams

    onDodgeCallback = this.onDodge.bind(this)

    dodgeCount = 0

    constructor(params: EvasionBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    override startEffect(character: Character): void {
        character.triggers.on(CHARACTER_TRIGGERS.ON_DODGE, this.onDodgeCallback)
        super.startEffect(character)
    }

    override endEffect(character: Character) {
        super.endEffect(character)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        if (this.params.speedsUpOnHit) {
            stats.derived.castSpeed.set(stats.derived.castSpeed.value + (10 * this.dodgeCount))
        }

        stats.derived.dodgeChance.set(stats.derived.dodgeChance.value + 75)
        return stats
    }

    onDodge(trigger: CharacterTriggerPayload<OnDodgeTrigger>) {
        if (this.params.speedsUpOnHit) {
            this.dodgeCount += 1
            trigger.character.recalculateStats()
        }
    }

}