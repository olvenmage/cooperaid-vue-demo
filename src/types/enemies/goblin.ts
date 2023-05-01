
import type Character from '../character';
import Identity from '../identity';
import Skill, { SkillRange, TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData, { DynamicSkillDataValue } from '../skill-data';

export default class Goblin extends Identity {
    public name = "Goblin"
    public baseStats = new CoreStats({
        baseHealth: 45,
        constitution: 8,
        strength: 10,
        dexterity: 12,
        intelligence: 4
    })
    public imagePath = "/enemies/goblin.png"

    public skills = [
        new GoblinBite(),
        new GoblinClobber()
    ]
}

class GoblinClobber extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Clobber",
        energyCost: 8,
        cooldown: 10 * 1000,
        castTime: 6 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(5).modifiedBy('strength', 1),
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.PHYSICAL })
    }
}


class GoblinBite extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Bite",
        energyCost: 4,
        cooldown: 0 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(3).modifiedBy('strength', 0.25).modifiedBy('dexterity', 0.25),
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.PHYSICAL })
    }
}