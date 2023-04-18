import GameSettings from '@/core/settings';
import type Character from '../character';
import TickBuff from '../tick-buff';
import type StatMutatingBuff from '../stat-mutating-buff';
import type CharacterStats from '../character-stats';
import { isEmpowerableSkil } from '../empowerable-skill';
import FerocityBar from '../special-bar/ferocity-bar';

export default class Ferocious extends TickBuff implements StatMutatingBuff {
    // interval in miliseconds (1000 = every second)
    public baseTickInterval: number = 1000

    START_DURATION = 1
    CONSUME_AMOUNT = 12

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
        stats.energyBoost.set(stats.energyBoost.value + 20)
        stats.armor.set(stats.armor.value + 3)
        stats.magicalArmor.set(stats.magicalArmor.value + 3)

        return stats
    }

    override startEffect(character: Character): void {
        if (character.classBar instanceof FerocityBar) {
            character.identity.imagePath = "/classes/druid-bear.png"
            character.classBar.activated = true
            character.skills.forEach((sk) => {
                if (isEmpowerableSkil(sk)) {
                    sk.empower(character)
                }
            })
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        this.duration = this.START_DURATION

        if (character.classBar) {
            //character.classBar.current = 0
            character.identity.imagePath = "/classes/druid.png"
            character.classBar.activated = false

            if (character.classBar instanceof FerocityBar) {
                character.skills.forEach((sk) => {
                    if (isEmpowerableSkil(sk)) {
                        sk.unempower(character)
                    }
                })
            }
        }

        super.endEffect(character)
    }
}