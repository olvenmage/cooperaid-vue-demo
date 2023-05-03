
import type Character from '../character';
import Identity from '../identity';
import Skill, { AiTargetting, SkillRange, TargetType } from '../skill';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData, { DynamicSkillDataValue } from '../skill-data';
import { BlessingOfProtection } from '../classes/paladin';
import StunnedBuff from '../buffs/stunned';

export default class Healer extends Identity {
    public name = "Healer"
    public baseStats = new CoreStats({
        baseHealth: 30,
        constitution: 10,
        strength: 8,
        dexterity: 12,
        intelligence: 20
    })
    public imagePath = "/enemies/healer.png"

    public skills = [
        new CureWounds(),
        new PrayerOfHealing(),
        new BlessingOfProtection(),
        new Repent(),
    ]
}

class CureWounds extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Cure Wounds",
        energyCost: 3,
        cooldown: 5 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.RANGED,
        healing: new DynamicSkillDataValue(2).modifiedBaseBy('intelligence', 0.6)
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.restoreHealth(this.skillData.healing.value, castBy)
        })
    }
}

class PrayerOfHealing extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Prayer Of Healing",
        energyCost: 6,
        cooldown: 12 * 1000,
        castTime: 4.5 * 1000,
        targetType: TargetType.TARGET_ALL_FRIENDLIES,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.RANGED,
        healing: new DynamicSkillDataValue(2).modifiedBaseBy('intelligence', 0.7)
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.restoreHealth(this.skillData.healing.value, castBy)
        })
    }
}

class Repent extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Repent",
        energyCost: 8,
        cooldown: 25 * 1000,
        castTime: 3.5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.RANGED,
        buffDuration: 2.5 * 1000
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new StunnedBuff({
                duration: this.skillData.buffDuration
            }), castBy)
        })
    }
}