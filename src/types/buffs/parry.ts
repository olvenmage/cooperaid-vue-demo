import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';


export class ParryHasteBuff extends Buff implements StatMutatingBuff {
    duration: number = 6 * 1000
    public imagePath: string | null = "/buffs/parry-haste.png"

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.energyBoost.set(stats.energyBoost.value + (25))
        stats.speed.set(stats.speed.value + (25))

        return stats
    }
}

export default class ParryBuff extends Buff {
    duration: number = 6 * 1000
    priority = BuffPriority.LAST_1

    public imagePath: string | null = "/buffs/parry.png"

    ARMOR_VALUE = 8

    triggered = false

    callback = this.parry.bind(this)

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

    parry(trigger: OnDamageTrigger): number {
        if (trigger.damageType == DamageType.PHYSICAL) {
            this.triggered = true
            trigger.character.addBuff(new ParryHasteBuff(), trigger.character)
            this.endEffect(trigger.character)
            return Math.round(trigger.actualDamage / 2)
        }

        return trigger.actualDamage
    }
}