
import type Character from '../character';
import Identity from '../identity';
import Skill, { SkillRange, TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData, { DynamicSkillDataValue } from '../skill-data';
import PiercedEarsBuff from '../buffs/pierced-ears'
import FlyingBuff from '../buffs/flying'

export default class Gryphon extends Identity {
    public name = "Gryphon"
    public baseStats = new CoreStats({
        baseHealth: 90,
        constitution: 20,
        strength: 20,
        dexterity: 24,
        intelligence: 15
    })
    public imagePath = "/enemies/gryphon.png"

    public skills = [
        new TakeFlight(),
        new BeakAttack(),
        new Squawk(),
        new SkyDive()
    ]
}

class BeakAttack extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Beak Attack",
        energyCost: 5,
        cooldown: 1 * 1000,
        castTime: 3.5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(2).modifiedBy('strength', 0.4).modifiedBy('dexterity', 0.4),
    })

    override canCast(castBy: Character): boolean {
        if (castBy.stats.flying) {
            return false
        }

        return super.canCast(castBy)
    }

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.PHYSICAL })
    }
}

class SkyDive extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Sky Dive",
        energyCost: 5,
        cooldown: 1 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        damage: new DynamicSkillDataValue(4).modifiedBy('strength', 0.5).modifiedBy('dexterity', 0.5),
        range: SkillRange.RANGED,
    })

    override canCast(castBy: Character): boolean {
        if (!castBy.stats.flying) {
            return false
        }

        return super.canCast(castBy)
    }

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.PHYSICAL })
    }
}



class Squawk extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Squawk",
        energyCost: 3,
        cooldown: 12 * 1000,
        castTime: 2 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.RANGED,
        constitutionDamageModifier: 0.3,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: 2, targets, type: DamageType.PHYSICAL, minAmount: 2 })

        targets.forEach((target) => {
            target.addBuff(new PiercedEarsBuff(), castBy)
        })
    }
}

class TakeFlight extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Take Flight",
        energyCost: 6,
        cooldown: 24 * 1000,
        castTime: 5 * 1000,
        targetType: TargetType.TARGET_SELF,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.RANGED,
        buffDuration: 10 * 1000
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.addBuff(new FlyingBuff(this.skillData.buffDuration), castBy)
    }
}