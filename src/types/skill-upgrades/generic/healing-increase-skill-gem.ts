import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class HealingIncreaseSkillGem extends SkillUpgradeGem {
    public description: string = "Increases healing done by 20%"
    public name = "Basic Healing Upgrade"

    applies(item: Skill): boolean {
        return item.skillData.healing > 0
    }

    applyUpgrade(item: Skill) {
       if ( item.skillData.damage != null) {
            item.skillData.healing *= 1.2
       }
    }
}