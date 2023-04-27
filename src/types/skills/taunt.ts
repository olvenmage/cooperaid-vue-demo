import type Character from "../character";
import Skill, { AiTargetting, SkillRange, SkillTag, TargetType } from "../skill";
import SkillData from "../skill-data";

export default class Taunt extends Skill {
    skillData: SkillData = new SkillData({
        name: "Taunt",
        energyCost: 2,
        cooldown: 6 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 500,
        imagePath: "/neutral/taunt.png",
        tags: [SkillTag.SUPPORT],
        range: SkillRange.RANGED
    })
 
    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (target.threat) {
                target.threat.tauntedBy(castBy)
            } else {
                
            }
        })
    }
}