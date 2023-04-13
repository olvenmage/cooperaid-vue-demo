import GameSettings from '@/core/settings';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import TickBuff from '../tick-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class Untouchable extends TickBuff implements StatMutatingBuff {
    // interval in miliseconds (1000 = every second)
    public baseTickInterval: number = 1000

    START_DURATION = 1
    CONSUME_AMOUNT = 15

    duration: number = this.START_DURATION

    private returnDamageCallback = this.returnDamage.bind(this)

    tickEffect(character: Character) {
        if (character.classBar) {
            const consumedAmount = Math.min(this.CONSUME_AMOUNT, character.classBar.current)
            character.classBar.decrease(consumedAmount)
            const consumeEffectiveness = (this.CONSUME_AMOUNT / consumedAmount)

            this.duration += this.tickInterval / consumeEffectiveness
        }
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.magicalArmor.set(stats.magicalArmor.value + stats.armor.value)

        // transform armor to +mag armor
        stats.armor.onChange((newVal, oldVal) => {
            stats.magicalArmor.set(stats.magicalArmor.value - oldVal)
            stats.magicalArmor.set(stats.magicalArmor.value + newVal)
        })

        return stats
    }

    override startEffect(character: Character): void {
        character.identity.onDamageTakenTriggers.push(this.returnDamageCallback)

        if (character.classBar) {
            character.classBar.activated = true
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        this.duration = this.START_DURATION

        const returnDmgIndex = character.identity.onDamageTakenTriggers.findIndex((trigger) => trigger == this.returnDamageCallback)
        
        if (returnDmgIndex != -1) {
            character.identity.onDamageTakenTriggers.splice(returnDmgIndex, 1)
        }

        if (character.classBar) {
            //character.classBar.current = 0
            character.classBar.activated = false
        }

        super.endEffect(character)
    }

    returnDamage(params: OnDamageTrigger) {
        if (!params.damagedBy) {
            return
        }

        params.character.dealDamageTo({
            amount: params.originalDamage - params.actualDamage,
            target: params.damagedBy,
            type: DamageType.PHYSICAL,
            threatModifier: 2
        })
    }
}