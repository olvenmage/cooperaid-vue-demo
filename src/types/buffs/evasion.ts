import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

interface EvasionBuffParams {
    duration: number
    speedsUpOnHit: boolean
}

export default class EvasionBuff extends Buff implements StatMutatingBuff {
    duration: number = 4 * 1000
    priority = BuffPriority.LAST_1

    public imagePath: string | null = "/skills/rogue/evasion.png"

    ARMOR_VALUE = 8

    triggered = false

    callback = this.dodge.bind(this)

    params: EvasionBuffParams

    dodgeCount = 0

    constructor(params: EvasionBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    override startEffect(character: Character): void {
        this.dodgeCount = 0
        character.identity.beforeDamageTakenTriggers.push(this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        const index = character.identity.beforeDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.beforeDamageTakenTriggers.splice(index, 1)
        }
        
        super.endEffect(character)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        if (this.params.speedsUpOnHit) {
            stats.derived.castSpeed.set(stats.derived.castSpeed.value + (10 * this.dodgeCount))
        }
        return stats
    }

    dodge(trigger: OnDamageTrigger): number {
        // 75% dodge
        if (trigger.damageType == DamageType.PHYSICAL && Math.random() >= 0.25) {
            this.dodgeCount++;

            if (this.givenBy?.classBar) {
                this.givenBy.classBar.increase(3)
            }

            return 0
        }

        return trigger.actualDamage
    }
}