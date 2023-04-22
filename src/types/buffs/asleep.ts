import randomRange from '@/utils/randomRange';
import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import FocusBar from '../special-bar/focus-bar';
import TickBuff from '../tick-buff';

export default class SleepBuff extends TickBuff implements StatMutatingBuff {
    public tickInterval: number = 1000;
    duration: number = 7 * 1000

    triggered = false

    callback = this.breakSleep.bind(this)
    
    public imagePath: string | null = "/skills/rogue/sleep-dart.png"

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }

    tickEffect(character: Character): void {
        if (this.givenBy?.classBar instanceof FocusBar) {
            this.givenBy.classBar.increase(
                3
            )
        }
    }

    override startEffect(character: Character): void {
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

    breakSleep(trigger: OnDamageTrigger): number {
        if (!this.triggered && trigger.actualDamage > 0) {
            this.triggered = true

            if (trigger.damagedBy) {
                trigger.character.ai?.raiseThreat(trigger.damagedBy, 10)
            }

            this.endEffect(trigger.character)
        }

        return trigger.actualDamage
    }
}