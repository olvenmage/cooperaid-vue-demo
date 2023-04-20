import Buff from '../buff';
import type Character from '../character';
import TickBuff from '../tick-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class SavingGrace extends TickBuff {
    tickInterval = 1000

    CONSUME_AMOUNT = 25
    START_DURATION =  1

    duration: number = this.START_DURATION

    callback = this.preventDamage.bind(this)
    
    override tickEffect(character: Character) {
        if (this.givenBy?.classBar) {
            const consumedAmount = Math.min(this.CONSUME_AMOUNT, this.givenBy.classBar.current)
            this.givenBy.classBar.decrease(consumedAmount)

            this.increaseDuration(this.tickInterval / consumeEffectiveness)
        }
    }

    
    override startEffect(character: Character): void {
        if (this.givenBy?.classBar != null) {
            this.givenBy.classBar.activated = true
        }

        character.identity.beforeDamageTakenTriggers.push(this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        if (this.givenBy?.classBar != null) {
            this.givenBy.classBar.activated = false
            this.duration = this.START_DURATION
        }

        const index = character.identity.beforeDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.beforeDamageTakenTriggers.splice(index, 1)
        }
        
        super.endEffect(character)
    }

    preventDamage(trigger: OnDamageTrigger): number {
        return 0
    }
}