
import type Character from '../character';
import Identity from '../identity';
import Skill, { SkillRange, TargetType } from '../skill';
import DamageType from '../damage-type';
import randomRange from '@/utils/randomRange';
import MeltedArmorBuff from '../buffs/melted-armor';
import CharacterStats from '../character-stats';
import ClassBar from '../class-bar';
import SkillData from '../skill-data';

export default class DragonEgg extends Identity {
    public name = "Dragon Egg"
    public baseStats = CharacterStats.fromObject({ maxHealth: 40, armor: -1, magicalArmor: -1, energyBoost: -10 })
    public imagePath = "/enemies/dragon/dragon-egg.png"

    public skills = [
        new Stir(),
    ]

    override onCreated(character: Character) {
        character.classBar = new ClassBar(100, 'orange')

        if (character.classBar != null) {
            character.classBar.onFilled = () => {
                this.name = "Dragon Whelp"
                this.baseStats = CharacterStats.fromObject({ maxHealth: 75, armor: 1 })
                character.recalculateStats()
                character.healthBar.current = character.healthBar.max
                this.imagePath = "/enemies/dragon/dragon-whelp.png"
                character.classBar = null
                character.energyBar.current = character.energyBar.max

                character.removeSkill(Stir)
                character.addSkill(new WhelpBite())
                character.addSkill(new Ember())
            }
        }
      
        super.onCreated(character)
    }
}

class Stir extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Stir",
        energyCost: 3,
        cooldown: 2 * 1000,
        castTime: 2 * 1000,
        targetType: TargetType.TARGET_NONE,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        if (castBy.classBar != null) {
            castBy.classBar.increase(20)
        }
    }
}

export class WhelpBite extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Bite",
        energyCost: 3,
        cooldown: 1 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null,
        range: SkillRange.MELEE,
    })


    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: 5, targets, type: DamageType.PHYSICAL })
    }
}

export class Ember extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Firespew",
        energyCost: 8,
        cooldown: 4 * 1000,
        castTime: 4 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null,
        range: SkillRange.RANGED,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: 8, targets, type: DamageType.MAGICAL })
    }
}