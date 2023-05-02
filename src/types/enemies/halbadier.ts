
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
import ParryBuff from '../buffs/parry';

export default class Halbadier extends Identity {
    public name = "Halbadier"
    public baseStats = new CoreStats({
        baseHealth: 50,
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
        energyCost: 4,
        cooldown: 10 * 1000,
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
        energyCost: 5,
        cooldown: 0 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(2).modifiedBaseBy('strength', 0.8)
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.PHYSICAL })
    }
}

class OverheadSlash extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Overhead Slash",
        energyCost: 8,
        cooldown: 12 * 1000,
        castTime: 5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(4).modifiedBaseBy('strength', 1.2)
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.PHYSICAL })
    }
}