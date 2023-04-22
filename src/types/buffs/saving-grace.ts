import Buff from '../buff';
import type Character from '../character';
import TickBuff from '../tick-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class SavingGrace extends Buff {
    duration: number = 9999999
    showDuration = false

    public imagePath: string | null = "/buffs/saving-grace.png"

    callback = this.preventDamage.bind(this)
    
    
    override startEffect(character: Character): void {
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

    preventDamage(trigger: OnDamageTrigger): number {
        return 0
    }
}