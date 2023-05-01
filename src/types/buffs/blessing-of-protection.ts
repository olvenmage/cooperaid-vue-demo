import Game from '@/core/game';
import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';

export default class BlessingOfProtectionBuff extends Buff implements StatMutatingBuff {
    duration: number = 8 * 1000
    callback = this.giveHolyToPaladin.bind(this)
    priority = BuffPriority.LATE_3

    public imagePath: string | null = "/skills/paladin/blessing-of-protection.png"

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }

    override startEffect(character: Character): void {
        if (character.classBar) {
            character.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)

        super.endEffect(character)
    }

    giveHolyToPaladin(trigger: CharacterTriggerPayload<OnDamageTrigger>) {
        if (this.givenBy?.classBar != null) {
            this.givenBy.classBar.increase(4)
        }
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.armor.set(Math.round(stats.derived.armor.value * 1.3))
        return stats
    }
}