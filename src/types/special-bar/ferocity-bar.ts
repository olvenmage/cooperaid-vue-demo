import type Character from '../character'
import type CharacterStats from '../character-stats'
import ClassBar from '../class-bar'
import { isEmpowerableSkil } from '../skill-types/empowerable-skill'

export default class FerocityBar extends ClassBar {
    public tickInterval: number = 1000
    tickConsumeAmount = 12

    constructor() {
        super(100, "#E72418")
    }

    tickEffect(character: Character) {
    }

    override mutateStats(stats: CharacterStats): CharacterStats {
        stats.energyBoost.set(stats.energyBoost.value + 20)
        stats.armor.set(stats.armor.value + 3)
        stats.magicalArmor.set(stats.magicalArmor.value + 3)

        return stats
    }

    override onActivatedStart(character: Character): void {
        character.identity.imagePath = "/classes/druid-bear.png"
        character.skills.forEach((sk) => {
            if (isEmpowerableSkil(sk)) {
                sk.empower(character)
                sk.finishCooldown()
            }
        })
}

    override onActivatedEnd(character: Character): void {
         //character.classBar.current = 0
         character.identity.imagePath = "/classes/druid.png"

         if (character.classBar instanceof FerocityBar) {
             character.skills.forEach((sk) => {
                 if (isEmpowerableSkil(sk)) {
                     sk.unempower(character)
                     sk.finishCooldown()
                 }
             })
         }
    }
}