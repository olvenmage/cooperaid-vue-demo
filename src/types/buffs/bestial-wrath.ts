import GameSettings from '@/core/settings';
import type Character from '../character';
import TickBuff from '../tick-buff';
import type StatMutatingBuff from '../stat-mutating-buff';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import FerocityBar from '../special-bar/ferocity-bar';

export default class BestialWrathBuff extends TickBuff implements StatMutatingBuff {
    // interval in miliseconds (1000 = every second)
    public tickInterval: number = 1000

    duration: number = 10 * 1000
    public unique: boolean = true

    buildAmount = 1
    callback = this.enrage.bind(this)

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }
   

    tickEffect(character: Character) {
        if ((!(character.classBar instanceof FerocityBar)) && !character.classBar?.activated) {
            this.endEffect(character)
            return
        }

        if (!character.stats.stunned) {
            this.buildAmount++
        }

        character.takeDamage({
            amount: Math.round((0.005 * this.buildAmount) * character.healthBar.max),
            damagedBy: character,
            type: DamageType.BLEED
        })
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.speed.set(stats.speed.value + (8 * this.buildAmount))
        stats.energyBoost.set(stats.energyBoost.value + (8 * this.buildAmount))

        return stats
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

    enrage(trigger: OnDamageTrigger): number {
        if (trigger.damageType == DamageType.PHYSICAL && trigger.damagedBy && trigger.damagedBy.id != trigger.character.id) {
            this.buildAmount++;
        }

        return trigger.actualDamage
    }
}