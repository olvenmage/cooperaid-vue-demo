
import type Character from '../character';
import Identity from '../identity';
import Skill, { AiTargetting, SkillRange, TargetType } from '../skill';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData from '../skill-data';
import RapidFireBuff from '../buffs/rapid-fire';

export default class Archer extends Identity {
    public name = "Archer"
    public baseStats = new CoreStats({
        baseHealth: 30,
        constitution: 10,
        strength: 16,
        dexterity: 16,
        intelligence: 4
    })
    public imagePath = "/enemies/archer.png"

    public skills = [
        new Shoot(),
        new Assasinate(),
        new RapidFire()
    ]
}

class RapidFire extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Rapid Fire",
        energyCost: 8,
        cooldown: 25 * 1000,
        castTime: 2 * 1000,
        targetType: TargetType.TARGET_SELF,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.addBuff(new RapidFireBuff(), castBy))
    }
}

class Shoot extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Shoot",
        energyCost: 2,
        cooldown: 0 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.HIGHEST_THREAT,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.RANGED,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: 9, targets, type: DamageType.PHYSICAL })
    }
}

class Assasinate extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Assasinate",
        energyCost: 6,
        cooldown: 12 * 1000,
        castTime: 6 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        aiTargetting: AiTargetting.RANDOM,
        imagePath: null,
        range: SkillRange.RANGED,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: 18, targets, type: DamageType.PHYSICAL })
    }
}