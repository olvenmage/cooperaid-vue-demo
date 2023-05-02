import type Character from "@/types/character";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class EnergyCostSkillGem extends SkillUpgradeGem {
    public description: string = "Reduces a skill with an energy cost above 3 by one"
    public name = "Basic Energy Cost Upgrade"

    applies(item: Skill): boolean {
        return item.baseSkillData.energyCost > 3
    }

    applyUpgrade(character: Character, item: Skill) {
       if ( item.baseSkillData.damage != null) {
            item.baseSkillData.energyCost -= 1
       }
    }
}