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

interface BlessedWeaponBuffParams {
    duration: number,
    damageAmount: number
}

export default class BlessedWeaponBuff extends Buff {
    duration: number = 5 * 1000
    priority = BuffPriority.LAST_1

    public imagePath: string | null = "/skills/paladin/blessed-weapon.png"

    callback = this.increaseDamage.bind(this)
    params: BlessedWeaponBuffParams

    constructor(params: BlessedWeaponBuffParams) {
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

    increaseDamage(trigger: CharacterTriggerPayload<SkillData>) {
        if (trigger.range == SkillRange.MELEE && trigger.damageType == DamageType.PHYSICAL) {
            trigger.damage += this.params.damageAmount
        }
    }
}