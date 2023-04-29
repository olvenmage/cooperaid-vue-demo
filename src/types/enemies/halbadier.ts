
import type Character from '../character';
import Identity from '../identity';
import Skill, { SkillRange, TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData from '../skill-data';
import PiercedEarsBuff from '../buffs/pierced-ears'
import FlyingBuff from '../buffs/flying'
import ParryBuff from '../buffs/parry';

export default class Halbadier extends Identity {
    public name = "Halbadier"
    public baseStats = new CoreStats({
        constitution: 20,
        strength: 16,
        dexterity: 8,
        intelligence: 5
    })
    public imagePath = "/enemies/halbadier.png"

    public skills = [
        new Poke(),
        new Parry(),
        new OverheadSlash()
    ]
}

class Parry extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Parry",
        energyCost: 3,
        cooldown: 8 * 1000,
        castTime: 1.5 * 1000,
        targetType: TargetType.TARGET_SELF,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.addBuff(new ParryBuff(), castBy))
    }
}

class Poke extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Poke",
        energyCost: 2,
        cooldown: 0 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
        damage: 6
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage, targets, type: DamageType.PHYSICAL })
    }
}

class OverheadSlash extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Overhead Slash",
        energyCost: 7,
        cooldown: 12 * 1000,
        castTime: 5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
        damage: 14
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage, targets, type: DamageType.PHYSICAL })
    }
}