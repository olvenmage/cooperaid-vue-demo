
import type Character from '../character';
import Identity from '../identity';
import Skill, { AiTargetting, SkillRange, TargetType } from '../skill';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';
import SkillData from '../skill-data';
import RapidFireBuff from '../buffs/rapid-fire';

export default class Archer extends Identity {
    public name = "Archer"
    public baseStats = CharacterStats.fromObject({ maxHealth: 60, armor: 1, magicalArmor: 0, energyBoost: 25 })
    public imagePath = "/enemies/archer.png"

    public skills = [
        new Shoot(),
        new Assasinate(),
        new RapidFire()
    ]
}

class RapidFire extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Rapid Fire",
        energyCost: 10,
        cooldown: 25 * 1000,
        castTime: 2 * 1000,
        targetType: TargetType.TARGET_SELF,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.addBuff(new RapidFireBuff(), castBy))
    }
}

class Shoot extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Shoot",
        energyCost: 2,
        cooldown: 0 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.HIGHEST_THREAT,
        imagePath: null,
        range: SkillRange.RANGED,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 9, target, type: DamageType.PHYSICAL }))
    }
}

class Assasinate extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Assasinate",
        energyCost: 6,
        cooldown: 12 * 1000,
        castTime: 4 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        imagePath: null,
        range: SkillRange.RANGED,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 18, target, type: DamageType.PHYSICAL }))
    }
}