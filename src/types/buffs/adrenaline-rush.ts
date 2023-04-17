import GameSettings from '@/core/settings';
import type Character from '../character';
import TickBuff from '../tick-buff';
import type StatMutatingBuff from '../stat-mutating-buff';
import type CharacterStats from '../character-stats';

export default class AdrenalineRush extends TickBuff implements StatMutatingBuff {
    // interval in miliseconds (1000 = every second)
    public baseTickInterval: number = 1000

    START_DURATION = 1
    CONSUME_AMOUNT = 18

    duration: number = this.START_DURATION
   

    tickEffect(character: Character) {
        if (character.classBar) {
            const consumedAmount = Math.min(this.CONSUME_AMOUNT, character.classBar.current)
            character.classBar.decrease(consumedAmount)
            const consumeEffectiveness = (this.CONSUME_AMOUNT / consumedAmount)

            this.duration += this.baseTickInterval / consumeEffectiveness
        }
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.speed.set(stats.speed.value + 50)
        stats.energyBoost.set(stats.energyBoost.value + 50)

        return stats
    }

    override startEffect(character: Character): void {
        if (character.classBar) {
            character.classBar.activated = true
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        this.duration = this.START_DURATION

        if (character.classBar) {
            //character.classBar.current = 0
            character.classBar.activated = false
        }

        super.endEffect(character)
    }
}