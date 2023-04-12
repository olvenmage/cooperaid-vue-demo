import Buff from '../buff';
import type Character from '../character';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class BlessingOfProtectionBuff extends Buff {
    duration: number = 8 * 1000
    callback = this.giveHolyToPaladin.bind(this)

    override startEffect(character: Character): void {
        if (character.classBar) {
            character.currentArmor += 3
            character.identity.onDamageTakenTriggers.push(this.callback)
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        character.currentArmor -= 3

        const index = character.identity.onDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.onDamageTakenTriggers.splice(index, 1)
        }

        super.endEffect(character)
    }

    giveHolyToPaladin(trigger: OnDamageTrigger) {
        if (this.givenBy?.classBar != null) {
            this.givenBy.classBar.increase(4)
        }
    }
}