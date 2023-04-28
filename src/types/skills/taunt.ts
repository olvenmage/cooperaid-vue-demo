import type Character from "../character";
import DamageType from "../damage-type";
import Skill, { AiTargetting, SkillRange, SkillTag, TargetType } from "../skill";
import SkillData from "../skill-data";

export default class Taunt extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Taunt",
        energyCost: 2,
        cooldown: 6 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 500,
        imagePath: "/neutral/taunt.png",
        damageType: DamageType.PHYSICAL,
        buffDuration: 3 * 1000,
        tags: [SkillTag.SUPPORT],
        range: SkillRange.RANGED
    })

    description: string | null = "Taunt an enemy, setting your threat towards the target equal to the current highest. Also forces the enemy to target you for a duration"
 
    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (target.threat) {
                target.threat.tauntedBy(castBy, this.skillData.buffDuration)
            } else {
                
            }
        })
    }
}