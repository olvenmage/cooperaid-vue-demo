import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class ShieldBlockBuff extends Buff implements StatMutatingBuff {
    duration: number = 5 * 1000

    ARMOR_VALUE = 8

    triggered = false

    callback = this.shieldBlock.bind(this)

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }

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
        stats.magicalArmor.set(stats.magicalArmor.value + stats.armor.value)

        // transform armor to +mag armor
        stats.armor.onChange((newVal, oldVal) => {
            stats.magicalArmor.set(stats.magicalArmor.value - oldVal)
            stats.magicalArmor.set(stats.magicalArmor.value + newVal)
        })
    
        return stats
    }

    shieldBlock(trigger: OnDamageTrigger): number {
        if (!this.triggered && trigger.originalDamage > (trigger.character.stats.armor.value - this.ARMOR_VALUE)) {
           console.log(`${trigger.character.identity.name} BY : ${trigger.damagedBy?.identity.name}`)
            this.triggered = true
            trigger.damagedBy?.dealDamageTo({amount: Math.ceil(trigger.character.stats.armor.value / 2), target: trigger.character, type: DamageType.PHYSICAL, threatModifier: 2})
            this.endEffect(trigger.character)
        }

        return trigger.actualDamage
    }
}