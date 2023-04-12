import GameSettings from '@/core/settings';
import type Character from '../character';
import TickBuff from '../tick-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class Untouchable extends TickBuff {
    // interval in miliseconds (1000 = every second)
    public baseTickInterval: number = 1000

    START_DURATION = 1
    CONSUME_AMOUNT = 8

    duration: number = this.START_DURATION

    callback = this.returnDamage.bind(this)

    tickEffect(character: Character) {
        if (character.classBar) {
            const consumedAmount = Math.min(this.CONSUME_AMOUNT, character.classBar.current)
            character.classBar.decrease(consumedAmount)
            const consumeEffectiveness = (this.CONSUME_AMOUNT / consumedAmount)

            this.duration += this.tickInterval / consumeEffectiveness
        }
    }

    override startEffect(character: Character): void {
        character.identity.onDamageTakenTriggers.push(this.callback)
        character.currentArmor += 2

        if (character.classBar) {
            character.classBar.activated = true
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        this.duration = this.START_DURATION

        const index = character.identity.onDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)
        
        if (index != -1) {
            character.identity.onDamageTakenTriggers.splice(index, 1)
        }

        character.currentArmor -= 2

        if (character.classBar) {
            //character.classBar.current = 0
            character.classBar.activated = false
        }

        super.endEffect(character)
    }

    returnDamage(params: OnDamageTrigger) {
        params.damagedBy?.takeDamage(
            params.originalDamage - params.actualDamage,
            params.character,
            1.5
        )
    }
}