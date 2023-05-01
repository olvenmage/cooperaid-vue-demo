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

interface BloodLustParams {
    duration: number,
    healthConsumed: number,
    increaseCrit: boolean
}

export default class BloodLustBuff extends Buff {
    duration: number = 5 * 1000
    priority = BuffPriority.LAST_1

    public imagePath: string | null = "/skills/barbarian/blood-lust.png"

    callback = this.increaseNextAttack.bind(this)
    params: BloodLustParams

    constructor(params: BloodLustParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    override startEffect(character: Character): void {
        character.triggers.on(CHARACTER_TRIGGERS.BEFORE_SKILL_CAST, this.callback)

        if (this.params.increaseCrit) {
            this.givenBy?.addBuff(
                new BloodBerserkBuff({
                    duration: this.duration
                })
                , this.givenBy
            )
        }

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.BEFORE_SKILL_CAST, this.callback)

        super.endEffect(character)
    }

    increaseNextAttack(trigger: CharacterTriggerPayload<SkillData>) {
        if (trigger.damageType == DamageType.PHYSICAL && trigger.damage.value > 0) {
            trigger.damage.value += this.params.healthConsumed
            this.endEffect(trigger.character)
        }
    }
}