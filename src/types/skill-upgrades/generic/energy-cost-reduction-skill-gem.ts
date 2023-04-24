import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class EnergyCostSkillGem extends SkillUpgradeGem {
    public description: string = "Reduces a skill with an energy cost above 3 by one"
    public name = "Basic Energy Cost Upgrade"

    applies(item: Skill): boolean {
        return item.skillData.energyCost > 3
    }

    applyUpgrade(item: Skill) {
       if ( item.skillData.damage != null) {
            item.skillData.energyCost -= 1
       }
    }
}