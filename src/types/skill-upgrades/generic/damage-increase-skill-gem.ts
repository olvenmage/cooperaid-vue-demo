import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class DamageIncreaseSkillGem extends SkillUpgradeGem {
    public description: string = "Increases damage dealt by 20%"
    public name = "Basic Damage Upgrade"

    applies(item: Skill): boolean {
        return item.skillData.damage > 0
    }

    applyUpgrade(item: Skill) {
       if ( item.skillData.damage != null) {
            item.skillData.damage *= 1.2
       }
    }
}