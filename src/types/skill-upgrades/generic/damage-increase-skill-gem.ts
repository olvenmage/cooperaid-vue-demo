import type Character from "@/types/character";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class DamageIncreaseSkillGem extends SkillUpgradeGem {
    public description: string = "Increases damage dealt by 20% of your main Stat"
    public name = "Basic Stat Damage Upgrade"

    applies(item: Skill): boolean {
        return item.baseSkillData.damage.value > 0
    }

    applyUpgrade(character: Character, item: Skill) {
       if ( item.baseSkillData.damage != null) {
            item.baseSkillData.damage.modifiedBy(character.stats.core.getHighest().type, 0.2)
       }
    }
}