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

interface BloodBerserkParams {
    duration: number,
}

export default class BloodBerserkBuff extends Buff implements StatMutatingBuff {
    duration: number = 5 * 1000
    priority = BuffPriority.LAST_1

    public imagePath: string | null = null
    public showDuration: boolean = false

    callback = this.increaseCritAttack.bind(this)
    params: BloodBerserkParams

    constructor(params: BloodBerserkParams) {
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
        stats.derived.critChance.set(stats.derived.critChance.value + 10)
        return stats
    }

    increaseCritAttack(trigger: CharacterTriggerPayload<SkillData>) {
        if (trigger.damageType == DamageType.PHYSICAL && trigger.damage > 0) {
            this.endEffect(trigger.character)
        }
    }
}