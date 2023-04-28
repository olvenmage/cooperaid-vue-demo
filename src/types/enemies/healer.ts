
import type Character from '../character';
import Identity from '../identity';
import Skill, { AiTargetting, SkillRange, TargetType } from '../skill';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData from '../skill-data';
import { BlessingOfProtection } from '../classes/paladin';

export default class Healer extends Identity {
    public name = "Healer"
    public baseStats = new CoreStats({
        constitution: 10,
        strength: 8,
        dexterity: 4,
        intelligence: 20
    })
    public imagePath = "/enemies/healer.png"

    public skills = [
        new CureWounds(),
        new PrayerOfHealing(),
        new BlessingOfProtection()
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
        healing: 10
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.restoreHealth(this.skillData.healing, castBy)
        })
    }
}

class PrayerOfHealing extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "PrayerOfHealing",
        energyCost: 6,
        cooldown: 12 * 1000,
        castTime: 5 * 1000,
        targetType: TargetType.TARGET_ALL_FRIENDLIES,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.RANGED,
        healing: 16
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.restoreHealth(this.skillData.healing, castBy)
        })
    }
}