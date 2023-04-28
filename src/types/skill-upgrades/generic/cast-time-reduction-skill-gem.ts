import type Character from "@/types/character";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class CastTimeReductionSkillGem extends SkillUpgradeGem {
    public description: string = "Reduces Cast time by 20%"
    public name = "Basic Cast Time Upgrade"

    applies(item: Skill): boolean {
        return item.baseSkillData.castTime > 0
    }

    applyUpgrade(item: Skill) {
       if ( item.baseSkillData.damage != null) {
            item.baseSkillData.castTime *= 0.8
       }
    }
}