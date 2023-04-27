import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';
import type SkillData from '../skill-data';
import FocusBar from '../special-bar/focus-bar';

interface CoughBuffParams {
    duration: number,
}

export default class CoughBombBuff extends Buff {
    duration: number = 5 * 1000
    priority = BuffPriority.LAST_1
    public unique: boolean = true

    public imagePath: string | null = "/skills/rogue/cough-bomb.png"

    callback = this.increaseCastSpeedNextSkill.bind(this)
    params: CoughBuffParams

    constructor(params: CoughBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    override startEffect(character: Character): void {
        character.triggers.on(CHARACTER_TRIGGERS.BEFORE_SKILL_START_CAST, this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.BEFORE_SKILL_START_CAST, this.callback)

        super.endEffect(character)
    }

    increaseCastSpeedNextSkill(trigger: CharacterTriggerPayload<SkillData>) {
        if (trigger.castTime > 0) {
            trigger.castTime *= 1.5

            if (this.givenBy?.classBar instanceof FocusBar) {
                this.givenBy.classBar.increase(6)
            }
            this.endEffect(trigger.character)
        }
    }
}