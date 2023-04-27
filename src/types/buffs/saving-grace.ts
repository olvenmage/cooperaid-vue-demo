import Buff from '../buff';
import type Character from '../character';
import { CHARACTER_TRIGGERS } from '../character-triggers';
import TickBuff from '../tick-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class SavingGrace extends Buff {
    duration: number = 9999999
    showDuration = false

    public imagePath: string | null = "/buffs/saving-grace.png"

    callback = this.preventDamage.bind(this)
    
    
    override startEffect(character: Character): void {
        character.triggers.on(CHARACTER_TRIGGERS.BEFORE_DAMAGE_TAKEN, this.callback)
        super.startEffect(character)
    }

    override endEffect(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.BEFORE_DAMAGE_TAKEN, this.callback)
        
        super.endEffect(character)
    }

    preventDamage(trigger: OnDamageTrigger) {
        trigger.actualDamage = 0
    }
}