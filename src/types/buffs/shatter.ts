import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';
import type { DealDamageToParams } from '../damage';
import DamageType from '../damage-type';
import { SkillRange } from '../skill';
import type SkillData from '../skill-data';
import type StatMutatingBuff from '../stat-mutating-buff';

interface ShatterBuffParams {
    duration: number,
}

export default class ShatterBuff extends Buff implements StatMutatingBuff {
    duration: number = 5 * 1000

    public imagePath: string | null = "/skills/juggernaut/shatter.png"
    callback = this.reduceDamage.bind(this)

    params: ShatterBuffParams

    constructor(params: ShatterBuffParams) {
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

    reduceDamage(trigger: CharacterTriggerPayload<SkillData>) {
        if (trigger.damageType == DamageType.PHYSICAL && trigger.damage.value > 0) {
            trigger.damage.value *= 0.7
        }
    }
}