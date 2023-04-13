import randomRange from '@/utils/randomRange';
import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class SappedBuff extends Buff implements StatMutatingBuff {
    duration: number = 6 * 1000

    triggered = false

    callback = this.breakSap.bind(this)

    override startEffect(character: Character): void {
        this.duration = randomRange(4, 8) * 1000
        character.identity.onDamageTakenTriggers.push(this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        const index = character.identity.onDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.onDamageTakenTriggers.splice(index, 1)
        }
        
        super.endEffect(character)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.stunned = true
    
        return stats
    }

    breakSap(trigger: OnDamageTrigger): number {
        if (!this.triggered && trigger.actualDamage > 0) {
            this.triggered = true
            this.endEffect(trigger.character)
        }

        return trigger.actualDamage
    }
}