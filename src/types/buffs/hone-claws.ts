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
import BloodBerserkBuff from './blood-berserk';

interface HoneClawsBuffParams {
    duration: number,
}

export default class HoneClawsBuff extends Buff implements StatMutatingBuff {
    duration: number = 5 * 1000
    priority = BuffPriority.EARLY_3

    public imagePath: string | null = "/skills/druid/bear/hone-claws.png"

    callback = this.increaseStackCount.bind(this)
    params: HoneClawsBuffParams

    stackCount = 1

    constructor(params: HoneClawsBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    override startEffect(character: Character): void {
        character.triggers.on(CHARACTER_TRIGGERS.BEFORE_SKILL_CAST, this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.BEFORE_SKILL_CAST, this.callback)

        super.endEffect(character)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.attackDamage.set(stats.derived.attackDamage.value + (this.stackCount * 2))
        return stats
    }

    increaseStackCount(trigger: CharacterTriggerPayload<SkillData>) {
        if (trigger.damageType == DamageType.PHYSICAL && trigger.damage.value > 0) {
            this.stackCount++
        }
    }
}