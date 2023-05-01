import Buff from '../buff';
import type Character from '../character';
import { CHARACTER_TRIGGERS } from '../character-triggers';
import DamageSchool from '../damage-school';
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

interface SmittenBuffParams {
    duration: number
    healing: number
    branding?: boolean
}

export default class SmittenBuff extends Buff {
    duration: number = 6 * 1000

    public imagePath: string | null = "/skills/paladin/smite.png"
    params: SmittenBuffParams
    

    callback = this.restoreHealthToAlly.bind(this)

    constructor(params: SmittenBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    override startEffect(character: Character): void {
        character.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)
        
        super.endEffect(character)
    }

    restoreHealthToAlly(trigger: OnDamageTrigger): void {
        const validDamageToEnemy = trigger.actualDamage > 0 && trigger.damagedBy && trigger.character.isEnemyTo(trigger.damagedBy)

        if (validDamageToEnemy && trigger.school != DamageSchool.HOLY && (trigger.damageType == DamageType.PHYSICAL || trigger.damageType == DamageType.MAGICAL)) {
            if (this.params.branding) {
                this.givenBy?.dealDamageTo({ amount: this.params.healing * 2, targets: [trigger.character], type: DamageType.MAGICAL, school: DamageSchool.HOLY, noCrit: true, minAmount: 4 })
            } else {
                trigger.damagedBy?.restoreHealth(this.params.healing, this.givenBy, 0.5)
            }

            if (this.givenBy?.classBar) {
                this.givenBy.classBar.increase(2)
            }
        }
    }
}