
import type Character from '../character';
import Identity from '../identity';
import Skill, { TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';
import SkillData from '../skill-data';
import PiercedEarsBuff from '../buffs/pierced-ears'
import FlyingBuff from '../buffs/flying'

export default class Gryphon extends Identity {
    public name = "Gryphon"
    public baseStats = CharacterStats.fromObject({ maxHealth: 150, armor: 2, magicalArmor: 2, energyBoost: 40 })
    public imagePath = "/enemies/gryphon.png"

    public skills = [
        new Squawk(),
        new BeakAttack()
    ]
}

class BeakAttack extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Beak Attack",
        energyCost: 4,
        cooldown: 8 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 14, target, type: DamageType.PHYSICAL }))
    }
}


class Squawk extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Squawk",
        energyCost: 2,
        cooldown: 10 * 1000,
        castTime: 1 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        imagePath: null
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: 2, target, type: DamageType.PHYSICAL, minAmount: 2 })
            target.addBuff(new PiercedEarsBuff(), castBy)
        })
    }
}

class TakeFlight extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Take Flight",
        energyCost: 6,
        cooldown: 30 * 1000,
        castTime: 2 * 1000,
        targetType: TargetType.TARGET_NONE,
        imagePath: null
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.addBuff(new FlyingBuff(8 * 1000), castBy)
    }
}