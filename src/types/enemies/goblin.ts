
import type Character from '../character';
import Identity from '../identity';
import Skill, { SkillRange, TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';
import SkillData from '../skill-data';

export default class Goblin extends Identity {
    public name = "Goblin"
    public baseStats = CharacterStats.fromObject({ maxHealth: 40, armor: 1 })
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
        castTime: 8 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 14, target, type: DamageType.PHYSICAL }))
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
        targets.forEach((target) => castBy.dealDamageTo({ amount: 5, target, type: DamageType.PHYSICAL }))
    }
}