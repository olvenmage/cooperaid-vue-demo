import Game from '@/core/game';
import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';
import type SkillData from '../skill-data';

interface BodyGuardParams {
    duration: number
    increasesDamage: boolean
}

export default class BodyGuardBuff extends Buff {
    duration: number = 8 * 1000
    callback = this.bodyGuardAlly.bind(this)
    increaseDamageCallback = this.increaseDamage.bind(this)

    public imagePath: string | null = "/skills/juggernaut/body-guard.png"
    public priority: BuffPriority = BuffPriority.LATE_2

    params: BodyGuardParams

    constructor(params: BodyGuardParams) {
        super()
        this.duration = params.duration
        this.params = params 
    }

    override startEffect(character: Character): void {
        character.triggers.on(CHARACTER_TRIGGERS.BEFORE_DAMAGE_TAKEN, this.callback)

        if (this.params.increasesDamage) {
            character.triggers.on(CHARACTER_TRIGGERS.BEFORE_SKILL_CAST, this.increaseDamageCallback)
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        character.triggers.off(CHARACTER_TRIGGERS.BEFORE_DAMAGE_TAKEN, this.callback)

        if (this.params.increasesDamage) {
            character.triggers.off(CHARACTER_TRIGGERS.BEFORE_SKILL_CAST, this.increaseDamageCallback)
        }

        super.endEffect(character)
    }

    bodyGuardAlly(trigger: OnDamageTrigger) {
        if (!this.givenBy) {
            return
        } 

        const damageReduced = Math.round(trigger.actualDamage / 2)

        this.givenBy.takeDamage({
            type: trigger.damageType,
            amount: damageReduced,
            damagedBy: trigger.damagedBy!,
            isCrit: trigger.isCrit,
        })

        trigger.actualDamage = trigger.actualDamage - damageReduced
    }

    increaseDamage(trigger: CharacterTriggerPayload<SkillData>) {
        trigger.damage.value *= 1.2
    }
}