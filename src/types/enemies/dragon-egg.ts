
import type Character from '../character';
import Identity from '../identity';
import Skill, { SkillRange, TargetType } from '../skill';
import DamageType from '../damage-type';
import randomRange from '@/utils/randomRange';
import MeltedArmorBuff from '../buffs/melted-armor';
import CharacterStats, { CoreStats } from '../character-stats';
import ClassBar from '../class-bar';
import SkillData, { DynamicSkillDataValue } from '../skill-data';

export default class DragonEgg extends Identity {
    public name = "Dragon Egg"
    public baseStats = new CoreStats({
        baseHealth: 28,
        constitution: 8,
        strength: 0,
        dexterity: 0,
        intelligence: 0
    })
    public imagePath = "/enemies/dragon/dragon-egg.png"

    public skills = [
        new Stir(),
    ]

    override onCreated(character: Character) {
        character.classBar = new ClassBar(100, 'orange')

        if (character.classBar != null) {
            character.classBar.onFilled = () => {
                this.name = "Dragon Whelp"
                this.baseStats = new CoreStats({
                    baseHealth: 50,
                    constitution: 12,
                    strength: 12,
                    dexterity: 12,
                    intelligence: 12
                })
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
    public baseSkillData: SkillData = new SkillData({
        name: "Stir",
        energyCost: 2,
        cooldown: 2 * 1000,
        castTime: 2 * 1000,
        targetType: TargetType.TARGET_NONE,
        damageType: DamageType.PHYSICAL,
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
    public baseSkillData: SkillData = new SkillData({
        name: "Bite",
        energyCost: 3,
        cooldown: 1 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(2).modifiedBy('strength', 0.6)
    })


    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.PHYSICAL })
    }
}

export class Ember extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Firespew",
        energyCost: 8,
        cooldown: 4 * 1000,
        castTime: 4 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.MAGICAL,
        imagePath: null,
        range: SkillRange.RANGED,
        damage: new DynamicSkillDataValue(5).modifiedBy('intelligence', 0.6)
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.MAGICAL })
    }
}