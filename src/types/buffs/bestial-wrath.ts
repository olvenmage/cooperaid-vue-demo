import GameSettings from '@/core/settings';
import type Character from '../character';
import TickBuff from '../tick-buff';
import type StatMutatingBuff from '../stat-mutating-buff';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import FerocityBar from '../special-bar/ferocity-bar';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';

export default class BestialWrathBuff extends TickBuff implements StatMutatingBuff {
    // interval in miliseconds (1000 = every second)
    public tickInterval: number = 1000

    duration: number = 10 * 1000
    public unique: boolean = true

    public imagePath: string | null = "/skills/druid/bear/bestial-wrath.png"

    buildAmount = 1
    callback = this.enrage.bind(this)

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }
   

    tickEffect(character: Character) {
        if (!this.givenBy?.classBar?.activated) {
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
        stats.derived.castSpeed.set(stats.derived.castSpeed.value + (8 * this.buildAmount))
        stats.derived.energyRegenHaste.set(stats.derived.energyRegenHaste.value + (8 * this.buildAmount))

        return stats
    }


    override startEffect(character: Character): void {
        character.triggers.on(CHARACTER_TRIGGERS.BEFORE_DAMAGE_TAKEN, this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.BEFORE_DAMAGE_TAKEN, this.callback)
        
        super.endEffect(character)
    }

    enrage(trigger: CharacterTriggerPayload<OnDamageTrigger>): void {
        if (trigger.damageType == DamageType.PHYSICAL && trigger.damagedBy && trigger.damagedBy.id != trigger.character.id) {
            this.buildAmount++;
        }
    }
}