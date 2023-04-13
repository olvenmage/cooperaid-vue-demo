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
    private reduceMagicalDamageCallback = this.reduceMagicalDamage.bind(this)

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

        stats.armor.onChange((newVal, oldVal) => {
            console.log(`OLD VALUE ${oldVal} NEW VALUE: ${newVal}`)

            stats.magicalArmor.set(stats.magicalArmor.value - oldVal)

            console.log(`MINUS: ${stats.magicalArmor.value}`)
            stats.magicalArmor.set(stats.magicalArmor.value + newVal)

            console.log(`PLUS: ${stats.magicalArmor.value}`)
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

        const reduceMagDmgIndex = character.identity.beforeDamageTakenTriggers.findIndex((trigger) => trigger == this.reduceMagicalDamageCallback)
        
        if (reduceMagDmgIndex != -1) {
            character.identity.beforeDamageTakenTriggers.splice(reduceMagDmgIndex, 1)
        }

        if (character.classBar) {
            //character.classBar.current = 0
            character.classBar.activated = false
        }

        super.endEffect(character)
    }

    reduceMagicalDamage(params: OnDamageTrigger): number {
        if (params.damageType == DamageType.MAGICAL) {
            return params.actualDamage - this.attachedCharacter!.stats.armor.value
        }

        return params.actualDamage
    }

    returnDamage(params: OnDamageTrigger) {
        params.damagedBy?.takeDamage(
            params.originalDamage - params.actualDamage,
            params.character,
            1.5
        )
    }
}