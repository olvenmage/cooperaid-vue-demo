import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class DamageIncreaseSkillGem extends SkillUpgradeGem {
    public description: string = "Increases damage dealt by 20%"
    public name = "Basic Damage Upgrade"

    applies(item: Skill): boolean {
        return item.baseSkillData.damage.value > 0
    }

    applyUpgrade(item: Skill) {
       if ( item.baseSkillData.damage != null) {
            item.baseSkillData.damage.value = Math.round(item.baseSkillData.damage.value * 1.2)
       }
    }
}