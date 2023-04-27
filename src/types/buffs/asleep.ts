import randomRange from '@/utils/randomRange';
import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import FocusBar from '../special-bar/focus-bar';
import TickBuff from '../tick-buff';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';

interface SleepBuffParams {
    duration: number,
    paralyzes: boolean,
    exposes: boolean
}

export default class SleepBuff extends TickBuff implements StatMutatingBuff {
    public tickInterval: number = 1000;
    duration: number = 7 * 1000

    triggered = false

    callback = this.breakSleep.bind(this)
    
    public imagePath: string | null = "/skills/rogue/sleep-dart.png"
    params: SleepBuffParams

    constructor(params: SleepBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    tickEffect(character: Character): void {
        if (this.givenBy?.classBar instanceof FocusBar) {
            this.givenBy.classBar.increase(
                3
            )
        }
    }

    override startEffect(character: Character): void {
        character.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)

        super.endEffect(character)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.stunned = true

        if (this.params.paralyzes) {
            stats.derived.castSpeed.set(stats.derived.castSpeed.value - 50)
        }
    
        return stats
    }

    breakSleep(trigger: CharacterTriggerPayload<OnDamageTrigger>): void {
        if (!this.triggered && trigger.actualDamage > 0) {
            this.triggered = true

            if (trigger.damagedBy) {
                trigger.character.threat?.raiseThreat(trigger.damagedBy, 10)
            }

            this.endEffect(trigger.character)

            if (this.params.exposes) {
                trigger.actualDamage = Math.round(trigger.actualDamage * 1.5)
            }
        }
    }
}