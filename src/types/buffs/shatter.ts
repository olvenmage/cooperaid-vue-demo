import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';
import type { DealDamageToParams } from '../damage';
import DamageType from '../damage-type';
import { SkillRange } from '../skill';
import type SkillData from '../skill-data';
import type StatMutatingBuff from '../stat-mutating-buff';
import type BeforePhysicalAttackTrigger from '../triggers/before-skill-cast-trigger';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

interface ShatterBuffParams {
    duration: number,
}

export default class ShatterBuff extends Buff implements StatMutatingBuff {
    duration: number = 5 * 1000

    public imagePath: string | null = "/skills/juggernaut/shatter.png"

    params: ShatterBuffParams

    constructor(params: ShatterBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.attackDamage.set(stats.derived.attackDamage.value - 4)
        return stats
    }
}