
import type Character from '../character';
import Identity from '../identity';
import Skill, { AiTargetting, SkillRange, TargetType } from '../skill';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData, { DynamicSkillDataValue } from '../skill-data';
import RapidFireBuff from '../buffs/rapid-fire';

export default class Archer extends Identity {
    public name = "Archer"
    public baseStats = new CoreStats({
        baseHealth: 50,
        constitution: 12,
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
        energyCost: 4,
        cooldown: 0 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.HIGHEST_THREAT,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.RANGED,
        damage: new DynamicSkillDataValue(2).modifiedBaseBy('dexterity', 0.3).modifiedBaseBy('strength', 0.3)
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.PHYSICAL })
    }
}

class Assasinate extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Assasinate",
        energyCost: 7,
        cooldown: 12 * 1000,
        castTime: 6 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        aiTargetting: AiTargetting.RANDOM,
        imagePath: null,
        range: SkillRange.RANGED,
        damage: new DynamicSkillDataValue(2).modifiedBaseBy('dexterity', 0.6).modifiedBaseBy('strength', 0.6)
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.PHYSICAL })
    }
}