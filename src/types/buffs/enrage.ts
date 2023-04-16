import GameSettings from '@/core/settings';
import type Character from '../character';
import TickBuff from '../tick-buff';

export default class Enrage extends TickBuff {
    // interval in miliseconds (1000 = every second)
    public baseTickInterval: number = 750

    START_DURATION = 1
    CONSUME_AMOUNT = 25

    duration: number = this.START_DURATION
   

    tickEffect(character: Character) {
        if (character.classBar) {
            const consumedAmount = Math.min(this.CONSUME_AMOUNT, character.classBar.current)
            character.classBar.decrease(consumedAmount)
            const consumeEffectiveness = (this.CONSUME_AMOUNT / consumedAmount)

            this.duration += this.baseTickInterval / consumeEffectiveness

            character.restoreHealth(
                Math.floor((0.05 / consumeEffectiveness) * character.healthBar.max),
                character,
                0.35
            )
        }
    }

    override startEffect(character: Character): void {
        if (character.classBar) {
            character.classBar.activated = true
            character.energyBar.energyRegenAmount = Math.ceil(GameSettings.defaultEnergyRegenAmount * 2)
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        this.duration = this.START_DURATION
        character.energyBar.energyRegenAmount = GameSettings.defaultEnergyRegenAmount

        if (character.classBar) {
            //character.classBar.current = 0
            character.classBar.activated = false
        }

        super.endEffect(character)
    }
}