import PoisonBuff from "../buffs/poison";
import type Character from "../character";
import Skill, { AiTargetting, SkillRange, SkillTag, TargetType } from "../skill";
import SkillData from "../skill-data";

export default class Bandage extends Skill {
    skillData: SkillData = new SkillData({
        name: "Bandage",
        energyCost: 3,
        cooldown: 4 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1800,
        imagePath: "/neutral/bandage.png",
        interuptsOnDamageTaken: true,
        healing: 6,
        range: SkillRange.MELEE,
        tags: [SkillTag.HEAL]
    })

    BASE_DAMAGE = 3

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.restoreHealth(this.skillData.healing, castBy, 0.6)
            target.buffs.removeBuffByType(PoisonBuff)
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}