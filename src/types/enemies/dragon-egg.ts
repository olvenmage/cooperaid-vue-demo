
import type Character from '../character';
import Identity from '../identity';
import Skill, { TargetType } from '../skill';
import DamageType from '../damage-type';
import randomRange from '@/utils/randomRange';
import MeltedArmorBuff from '../buffs/melted-armor';
import CharacterStats from '../character-stats';
import ClassBar from '../class-bar';

export default class DragonEgg extends Identity {
    public name = "Dragon Egg"
    public baseStats = CharacterStats.fromObject({ maxHealth: 40, armor: -2 })
    public imagePath = "/src/assets/dragon-egg.png"

    public skills = [
        new Stir(),
    ]

    override onCreated(character: Character) {
        character.classBar = new ClassBar(100, 'orange')

        if (character.classBar != null) {
            character.classBar.onFilled = () => {
                this.name = "Dragon Whelp"
                this.baseStats = CharacterStats.fromObject({ maxHealth: 50, armor: 1 })
                character.recalculateStats()
                character.healthBar.current = character.healthBar.max
                this.imagePath = "/src/assets/dragon-whelp.png"
                character.classBar = null
                character.energyBar.current = character.energyBar.max

                this.skills = [
                    new WhelpBite(),
                    new Ember()
                ]
            }
        }
      
        super.onCreated(character)
    }
}

class Stir extends Skill {
    name: string = "Stir"
    energyCost: number = 3;
    cooldown: number = 2 * 1000;
    castTime = 2 * 1000;
    targetType: TargetType = TargetType.TARGET_NONE

    castSkill(castBy: Character, targets: Character[]): void {
        if (castBy.classBar != null) {
            castBy.classBar.increase(20)
        }
    }
}

class WhelpBite extends Skill {
    name: string = "Bite"
    energyCost: number = 3;
    castTime = 3000;
    cooldown: number = 1 * 1000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.takeDamage(5, castBy, DamageType.PHYSICAL))
    }
}

class Ember extends Skill {
    name: string = "Ember"
    energyCost: number = 8;
    castTime = 4000;
    cooldown: number = 4 * 1000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.takeDamage(8, castBy, DamageType.MAGICAL))
    }
}