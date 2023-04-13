import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class ShieldBlockBuff extends Buff implements StatMutatingBuff {
    duration: number = 5 * 1000

    ARMOR_VALUE = 8

    callback = this.shieldBlock.bind(this)

    override startEffect(character: Character): void {
        character.identity.beforeDamageTakenTriggers.push(this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        const index = character.identity.beforeDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.beforeDamageTakenTriggers.splice(index, 1)
        }
        
        super.endEffect(character)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.armor.set(stats.armor.value + this.ARMOR_VALUE)
        return stats
    }

    shieldBlock(trigger: OnDamageTrigger): number {
        if (trigger.originalDamage > (trigger.character.stats.armor.value - this.ARMOR_VALUE)) {
            this.endEffect(trigger.character)
        }

        return trigger.actualDamage
    }
}