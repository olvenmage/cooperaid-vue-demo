import type Buff from '../buff'
import type Character from '../character'
import type CharacterStats from '../character-stats'
import { CHARACTER_TRIGGERS } from '../character-triggers'
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
        character.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.returnDamageCallback)

        character.buffs.forEach((buff: Buff) => {
            if (buff.givenBy != null && buff.givenBy.isEnemyTo(character)) {
                character.buffs.removeBuff(buff)
            }
        })
    }

    override onActivatedEnd(character: Character): void {
        character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.returnDamageCallback)

    }

    returnDamage(params: OnDamageTrigger) {
        if (!params.damagedBy) {
            return
        }

        params.character.dealDamageTo({
            amount: params.originalDamage - params.actualDamage,
            targets: [params.damagedBy],
            type: DamageType.PHYSICAL,
            threatModifier: 2,
            noCrit: true
        })
    }
}   