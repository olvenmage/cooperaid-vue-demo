import Buff from '../buff';
import type Character from '../character';
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

interface SmittenBuffParams {
    duration: number
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
        character.identity.onDamageTakenTriggers.push(this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        const index = character.identity.onDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.onDamageTakenTriggers.splice(index, 1)
        }
        
        super.endEffect(character)
    }

    restoreHealthToAlly(trigger: OnDamageTrigger): void {
        const validDamageToEnemy =trigger.actualDamage > 0 && trigger.damagedBy && trigger.character.isEnemyTo(trigger.damagedBy)

        if (validDamageToEnemy && (trigger.damageType == DamageType.PHYSICAL || trigger.damageType == DamageType.MAGICAL)) {
            if (this.params.branding) {
                this.givenBy?.dealDamageTo({ amount: 2, targets: [trigger.character], type: DamageType.MAGICAL, noCrit: true })
            } else {
                trigger.damagedBy?.restoreHealth(2, this.givenBy, 0.5)
            }

            if (this.givenBy?.classBar) {
                this.givenBy.classBar.increase(2)
            }
        }
    }
}