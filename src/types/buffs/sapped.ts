import randomRange from '@/utils/randomRange';
import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import FocusBar from '../special-bar/focus-bar';
import TickBuff from '../tick-buff';

export default class SappedBuff extends TickBuff implements StatMutatingBuff {
    public baseTickInterval: number = 1000;
    duration: number = 6 * 1000

    triggered = false

    callback = this.breakSap.bind(this)

    tickEffect(character: Character): void {
        if (this.givenBy?.classBar instanceof FocusBar) {
            this.givenBy.classBar.increase(
                4
            )
        }
    }

    override startEffect(character: Character): void {
        this.duration = randomRange(4, 8) * 1000
        character.identity.onDamageTakenTriggers.push(this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        const index = character.identity.onDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.onDamageTakenTriggers.splice(index, 1)
        }

        super.endEffect(character)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.stunned = true
    
        return stats
    }

    breakSap(trigger: OnDamageTrigger): number {
        if (!this.triggered && trigger.actualDamage > 0) {
            this.triggered = true
            this.endEffect(trigger.character)
        }

        return trigger.actualDamage
    }
}