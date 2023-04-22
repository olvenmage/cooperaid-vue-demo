import type Buff from '../buff'
import type Character from '../character'
import type CharacterStats from '../character-stats'
import ClassBar from '../class-bar'
import DamageType from '../damage-type'
import { isEmpowerableSkil } from '../skill-types/empowerable-skill'
import type OnDamageTrigger from '../triggers/on-damage-trigger'

export default class RetaliationBar extends ClassBar {
    constructor() {
        super(100, "silver")
    }

    public tickInterval: number = 1000
    tickConsumeAmount = 18

    returnDamageCallback = this.returnDamage.bind(this)

    tickEffect(character: Character) {
    }

    override onActivatedStart(character: Character): void {
        character.identity.onDamageTakenTriggers.push(this.returnDamageCallback)

        character.buffs.forEach((buff: Buff) => {
            if (buff.givenBy != null && buff.givenBy.isEnemyTo(character)) {
                character.buffs.removeBuff(buff)
            }
        })
    }

    override onActivatedEnd(character: Character): void {
        const returnDmgIndex = character.identity.onDamageTakenTriggers.findIndex((trigger) => trigger == this.returnDamageCallback)
        
        if (returnDmgIndex != -1) {
            character.identity.onDamageTakenTriggers.splice(returnDmgIndex, 1)
        }
    }

    returnDamage(params: OnDamageTrigger) {
        if (!params.damagedBy) {
            return
        }

        params.character.dealDamageTo({
            amount: params.originalDamage - params.actualDamage,
            target: params.damagedBy,
            type: DamageType.PHYSICAL,
            threatModifier: 2
        })
    }
}   