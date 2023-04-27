import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';
import type SkillData from '../skill-data';

interface ShadowStepParams {
    duration: number,
}

export default class ShadowStepBuff extends Buff {
    duration: number = 5 * 1000
    priority = BuffPriority.LAST_1
    public unique: boolean = true

    public imagePath: string | null = "/skills/rogue/shadow-step.png"

    callback = this.instantCastNextAttackSkill.bind(this)
    params: ShadowStepParams

    constructor(params: ShadowStepParams) {
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

    instantCastNextAttackSkill(trigger: CharacterTriggerPayload<SkillData>) {
        if (trigger.damage  > 0) {
            trigger.castTime = 0
            this.endEffect(trigger.character)
        }
    }
}