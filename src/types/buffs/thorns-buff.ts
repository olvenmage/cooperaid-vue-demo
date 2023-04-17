import GameSettings from '@/core/settings';
import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import TickBuff from '../tick-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class ThornsBuff extends Buff {
    public duration = 10 * 1000
    unique = true
    private returnDamageCallback = this.returnDamage.bind(this)

    override startEffect(character: Character): void {
        character.identity.onDamageTakenTriggers.push(this.returnDamageCallback)

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        const returnDmgIndex = character.identity.onDamageTakenTriggers.findIndex((trigger) => trigger == this.returnDamageCallback)
        
        if (returnDmgIndex != -1) {
            character.identity.onDamageTakenTriggers.splice(returnDmgIndex, 1)
        }

        super.endEffect(character)
    }

    returnDamage(params: OnDamageTrigger) {
        if (!params.damagedBy) {
            return
        }

        params.character.dealDamageTo({
            amount: 5,
            target: params.damagedBy,
            type: DamageType.PHYSICAL,
            threatModifier: 1
        })
    }
}