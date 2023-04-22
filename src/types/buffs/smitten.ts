import Buff from '../buff';
import type Character from '../character';
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class SmittenBuff extends Buff {
    duration: number = 6 * 1000

    public imagePath: string | null = "/skills/paladin/smite.png"
    

    callback = this.consumeSmitten.bind(this)

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
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

    consumeSmitten(trigger: OnDamageTrigger): void {
        if (trigger.actualDamage > 0 && trigger.damagedBy && trigger.character.isEnemyTo(trigger.damagedBy)) {
            this.endEffect(trigger.character)

            trigger.damagedBy?.restoreHealth(6, this.givenBy, 0.5)

            if (this.givenBy?.classBar) {
                this.givenBy.classBar.increase(10)
            }
        }
    }
}