import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import FocusBar from '../special-bar/focus-bar';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class DismantleBuff extends Buff implements StatMutatingBuff {
    duration: number = 8 * 1000

    callback = this.giveFocusPerHit.bind(this)

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.armor.set(stats.armor.value - 3)
        return stats
    }

    override startEffect(character: Character): void {
        if (character.classBar) {
            character.identity.onDamageTakenTriggers.push(this.callback)
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        const index = character.identity.onDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.onDamageTakenTriggers.splice(index, 1)
        }

        super.endEffect(character)
    }

    giveFocusPerHit(trigger: OnDamageTrigger) {
        if (trigger.damageType == DamageType.PHYSICAL && this.givenBy?.classBar instanceof FocusBar) {
            this.givenBy.classBar.increase(2)
        }
    }
}