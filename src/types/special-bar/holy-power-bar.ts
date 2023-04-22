import type Buff from '../buff'
import SavingGrace from '../buffs/saving-grace'
import type Character from '../character'
import type CharacterStats from '../character-stats'
import ClassBar from '../class-bar'
import DamageType from '../damage-type'
import { isEmpowerableSkil } from '../skill-types/empowerable-skill'
import type OnDamageTrigger from '../triggers/on-damage-trigger'

export default class HolyPowerBar extends ClassBar {
    constructor() {
        super(100, "gold")
    }

    public tickInterval: number = 500
    tickConsumeAmount = 12

    savingGrace = new SavingGrace()

    tickEffect(character: Character) {
    }

    saveTarget(character: Character, target: Character) {
        this.activate(character)
        target.dead = false
        target.addBuff(this.savingGrace, character)
        target.healthBar.current = 1
    }

    override onActivatedEnd(character: Character): void {
        this.savingGrace.endEffect(character)
    }
}   