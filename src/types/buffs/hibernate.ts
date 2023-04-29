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
import FerocityBar from '../special-bar/ferocity-bar';

interface HibernateBuffParams {
    duration: number,
    doesntInteruptOnDamage: boolean
}

export default class HibernateBuff extends TickBuff implements StatMutatingBuff {
    public tickInterval: number = 1000;
    duration: number = 7 * 1000

    triggered = false

    callback = this.breakSleep.bind(this)
    
    public imagePath: string | null = "/skills/druid/bear/calm.png"
    params: HibernateBuffParams

    constructor(params: HibernateBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    tickEffect(character: Character): void {
        if (this.givenBy?.classBar instanceof FerocityBar) {
            this.givenBy.classBar.decrease(
                10
            )

            character.restoreHealth(
                Math.floor(0.05 * character.healthBar.max),
                character,
                0.6
            )
        }
    }

    override startEffect(character: Character): void {
        if (!this.params.doesntInteruptOnDamage) {
            character.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)
        }

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)

        super.endEffect(character)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.stunned = true

        return stats
    }

    breakSleep(trigger: CharacterTriggerPayload<OnDamageTrigger>): void {
        if (!this.triggered && trigger.actualDamage > 0) {
            this.triggered = true

            if (trigger.damagedBy) {
                trigger.character.threat?.raiseThreat(trigger.damagedBy, 10)
            }

            this.endEffect(trigger.character)
        }
    }
}