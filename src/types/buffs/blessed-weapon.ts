import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';
import DamageType from '../damage-type';
import type SkillData from '../skill-data';
import type StatMutatingBuff from '../stat-mutating-buff';

interface BlessedWeaponBuffParams {
    duration: number,
    damageAmount: number
}

export default class BlessedWeaponBuff extends Buff implements StatMutatingBuff {
    duration: number = 5 * 1000

    public imagePath: string | null = "/skills/paladin/blessed-weapon.png"

    params: BlessedWeaponBuffParams
    callback = this.convertDamageType.bind(this)

    constructor(params: BlessedWeaponBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.attackDamage.set(stats.derived.attackDamage.value + this.params.damageAmount)
        return stats
    }

    override startEffect(character: Character): void {
        character.triggers.on(CHARACTER_TRIGGERS.BEFORE_SKILL_CAST, this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.BEFORE_SKILL_CAST, this.callback)

        super.endEffect(character)
    }

    convertDamageType(trigger: CharacterTriggerPayload<SkillData>) {
        if (trigger.character.id != this.attachedCharacter?.id && trigger.damageType == DamageType.PHYSICAL) {
            trigger.damageType = DamageType.MAGICAL
            if (this.givenBy?.classBar) {
                this.givenBy.classBar.increase(3)
            }

            this.endEffect(trigger.character)
        }
    }
}