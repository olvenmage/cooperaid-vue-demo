import type Character from '../character'
import ClassBar from '../class-bar'
import { isEmpowerableSkil } from '../skill-types/empowerable-skill'

export default class EmpowerBar extends ClassBar {
    constructor() {
        super(100, "#AB6DAC")
    }

    public tickInterval: number = 1000
    tickConsumeAmount = 15

    tickEffect(character: Character) {
    }

    override onActivatedStart(character: Character): void {
        character.skills.forEach((sk) => {
            if (isEmpowerableSkil(sk)) {
                sk.empower(character)
                sk.finishCooldown()
            }
        })
    }

    override onActivatedEnd(character: Character): void {
        character.skills.forEach((sk) => {
            if (isEmpowerableSkil(sk)) {
                sk.unempower(character)
                sk.finishCooldown()
            }
        })
    }
}   