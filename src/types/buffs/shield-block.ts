import Buff from '../buff';
import type Character from '../character';
import TickBuff from '../tick-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class ShieldBlockBuff extends Buff {
    duration: number = 5 * 1000

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

    shieldBlock(trigger: OnDamageTrigger): number {
        if (trigger.actualDamage > 0) {
            if (trigger.damagedBy) {
                trigger.damagedBy.takeDamage(5, trigger.character, 2)
            }

            this.endEffect(trigger.character)
            return Math.floor(trigger.actualDamage / 2)
        }

        return 0
    }
}