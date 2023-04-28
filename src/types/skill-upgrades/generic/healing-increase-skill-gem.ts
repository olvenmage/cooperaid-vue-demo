import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class HealingIncreaseSkillGem extends SkillUpgradeGem {
    public description: string = "Increases healing done by 20%"
    public name = "Basic Healing Upgrade"

    applies(item: Skill): boolean {
        return item.baseSkillData.healing > 0
    }

    applyUpgrade(item: Skill) {
       if ( item.baseSkillData.healing > 0) {
            item.baseSkillData.healing = Math.round(item.baseSkillData.healing * 1.2)
       }
    }
}