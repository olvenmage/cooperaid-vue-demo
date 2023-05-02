import PoisonBuff from "../buffs/poison";
import type Character from "../character";
import DamageType from "../damage-type";
import Skill, { AiTargetting, SkillRange, SkillTag, TargetType } from "../skill";
import SkillData, { DynamicSkillDataValue } from "../skill-data";

export default class Bandage extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Bandage",
        energyCost: 3,
        cooldown: 3 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1500,
        imagePath: "/neutral/bandage.png",
        interuptsOnDamageTaken: true,
        healing: new DynamicSkillDataValue(2).modifiedBaseBy('dexterity', 0.4).modifiedBaseBy('constitution', 0.4),
        range: SkillRange.MELEE,
        damageType: DamageType.PHYSICAL,
        tags: [SkillTag.HEAL]
    })

    description: string | null = "Heal an ally for {healing} and remove a poison debuff. Cast gets interupted on any damage taken."

    BASE_DAMAGE = 3

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.restoreHealth(this.skillData.healing.value, castBy, 0.6)
            target.buffs.removeBuffByType(PoisonBuff)
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}