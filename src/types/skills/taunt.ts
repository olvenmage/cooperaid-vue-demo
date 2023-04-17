import type Character from "../character";
import Skill, { AiTargetting, TargetType } from "../skill";
import SkillData from "../skill-data";

export default class Taunt extends Skill {
    skillData: SkillData = new SkillData({
        name: "Taunt",
        energyCost: 3,
        cooldown: 6 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 500,
        imagePath: "/neutral/taunt.png",
    })
 
    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.raiseThreat(castBy, castBy.healthBar.max / 1.5))
    }
}