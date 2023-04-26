
import type Character from '../character';
import Identity from '../identity';
import Skill, { SkillRange, TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData from '../skill-data';

export default class Goblin extends Identity {
    public name = "Goblin"
    public baseStats = new CoreStats({
        constitution: 2,
        strength: 4,
        dexterity: 6,
        intelligence: 2
    })
    public imagePath = "/enemies/goblin.png"

    public skills = [
        new GoblinBite(),
        new GoblinClobber()
    ]
}

class GoblinClobber extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Clobber",
        energyCost: 8,
        cooldown: 10 * 1000,
        castTime: 6 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: 12, targets, type: DamageType.PHYSICAL })
    }
}


class GoblinBite extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Bite",
        energyCost: 3,
        cooldown: 0 * 1000,
        castTime: 4 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: 4, targets, type: DamageType.PHYSICAL })
    }
}