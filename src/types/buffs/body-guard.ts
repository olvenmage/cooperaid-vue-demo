import Game from '@/core/game';
import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class BodyGuardBuff extends Buff {
    duration: number = 8 * 1000
    callback = this.bodyGuardAlly.bind(this)

    public imagePath: string | null = "/skills/juggernaut/body-guard.png"
    public priority: BuffPriority = BuffPriority.LATE_2

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }

    override startEffect(character: Character): void {
        if (character.classBar) {
            character.identity.beforeDamageTakenTriggers.push(this.callback)
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        const index = character.identity.beforeDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.beforeDamageTakenTriggers.splice(index, 1)
        }

        super.endEffect(character)
    }

    bodyGuardAlly(trigger: OnDamageTrigger): number {
        if (!this.givenBy) {
            return trigger.actualDamage
        } 

        const damageReduced = Math.round(trigger.actualDamage / 2)

        this.givenBy.takeDamage({
            type: trigger.damageType,
            amount: damageReduced,
            damagedBy: trigger.damagedBy!,
            isCrit: trigger.isCrit,
        })

        return trigger.actualDamage - damageReduced
    }
}