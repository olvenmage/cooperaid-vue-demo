
import type Character from '../character';
import Identity from '../identity';
import Skill, { SkillRange, TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';
import SkillData from '../skill-data';
import PiercedEarsBuff from '../buffs/pierced-ears'
import FlyingBuff from '../buffs/flying'
import ParryBuff from '../buffs/parry';

export default class Halbadier extends Identity {
    public name = "Halbadier"
    public baseStats = CharacterStats.fromObject({ maxHealth: 75, armor: 2, magicalArmor: 0 })
    public imagePath = "/enemies/halbadier.png"

    public skills = [
        new Poke(),
        new Parry(),
        new OverheadSlash()
    ]
}

class Parry extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Parry",
        energyCost: 8,
        cooldown: 10 * 1000,
        castTime: 1 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.addBuff(new ParryBuff(), castBy))
        targets.forEach((target) => castBy.dealDamageTo({ amount: 14, target, type: DamageType.PHYSICAL }))
    }
}

class Poke extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Poke",
        energyCost: 2,
        cooldown: 0 * 1000,
        castTime: 2 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 6, target, type: DamageType.PHYSICAL }))
    }
}

class OverheadSlash extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Overhead Slash",
        energyCost: 3,
        cooldown: 12 * 1000,
        castTime: 4 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 14, target, type: DamageType.PHYSICAL }))
    }
}