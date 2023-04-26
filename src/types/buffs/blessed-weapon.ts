import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import type { DealDamageToParams } from '../damage';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
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
        character.identity.beforeDealDamageTriggers.push(this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        const index = character.identity.beforeDealDamageTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.beforeDealDamageTriggers.splice(index, 1)
        }
        
        super.endEffect(character)
    }

    increaseDamage(trigger: DealDamageToParams, damagedBy: Character): DealDamageToParams {
        if (damagedBy.id == this.givenBy?.id && trigger.type == DamageType.PHYSICAL) {
            trigger.amount += this.params.damageAmount
        }

        return trigger
    }
}