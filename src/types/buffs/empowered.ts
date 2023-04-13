import GameSettings from '@/core/settings';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import { isEmpowerableSkil } from '../empowerable-skill';
import type StatMutatingBuff from '../stat-mutating-buff';
import TickBuff from '../tick-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class Empowered extends TickBuff {
    // interval in miliseconds (1000 = every second)
    public baseTickInterval: number = 1000

    START_DURATION = 1
    CONSUME_AMOUNT = 15

    duration: number = this.START_DURATION

    tickEffect(character: Character) {
        if (character.classBar) {
            const consumedAmount = Math.min(this.CONSUME_AMOUNT, character.classBar.current)
            character.classBar.decrease(consumedAmount)
            const consumeEffectiveness = (this.CONSUME_AMOUNT / consumedAmount)

            this.duration += this.tickInterval / consumeEffectiveness
        }
    }

    override startEffect(character: Character): void {
        if (character.classBar) {
            character.classBar.activated = true

            for (const skill of character.skills) {
                if (isEmpowerableSkil(skill)) {
                    skill.empower(character)
                }
            }
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        this.duration = this.START_DURATION

        if (character.classBar) {
            //character.classBar.current = 0
            character.classBar.activated = false

            for (const skill of character.skills) {
                if (isEmpowerableSkil(skill)) {
                    skill.unempower(character)
                }
            }
        }

        super.endEffect(character)
    }
}