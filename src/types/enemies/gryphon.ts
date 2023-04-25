
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

export default class Gryphon extends Identity {
    public name = "Gryphon"
    public baseStats = CharacterStats.fromObject({ maxHealth: 140, armor: 2, magicalArmor: 2, energyBoost: 40 })
    public imagePath = "/enemies/gryphon.png"

    public skills = [
        new TakeFlight(),
        new BeakAttack(),
        new Squawk(),
        new SkyDive()
    ]
}

class BeakAttack extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Beak Attack",
        energyCost: 4,
        cooldown: 2 * 1000,
        castTime: 3.5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    override canCast(castBy: Character): boolean {
        if (castBy.stats.flying) {
            return false
        }

        return super.canCast(castBy)
    }

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 12, target, type: DamageType.PHYSICAL }))
    }
}

class SkyDive extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Sky Dive",
        energyCost: 5,
        cooldown: 2 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null,
        damage: 18,
        range: SkillRange.RANGED,
    })

    override canCast(castBy: Character): boolean {
        if (!castBy.stats.flying) {
            return false
        }

        return super.canCast(castBy)
    }

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: this.skillData.damage, target, type: DamageType.PHYSICAL }))
    }
}



class Squawk extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Squawk",
        energyCost: 2,
        cooldown: 10 * 1000,
        castTime: 2 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        imagePath: null,
        range: SkillRange.RANGED,
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
        energyCost: 5,
        cooldown: 25 * 1000,
        castTime: 5 * 1000,
        targetType: TargetType.TARGET_SELF,
        imagePath: null,
        range: SkillRange.RANGED,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.addBuff(new FlyingBuff(10 * 1000), castBy)
    }
}