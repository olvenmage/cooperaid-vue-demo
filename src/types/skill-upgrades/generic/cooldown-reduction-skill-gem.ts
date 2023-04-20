import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class CooldownReductionSkillGem extends SkillUpgradeGem {
    public description: string = "Reduces cooldown by 20%"
    public name = "Basic Cooldown Reduction Upgrade"

    applies(item: Skill): boolean {
        return item.skillData.cooldown > 0
    }

    applyUpgrade(item: Skill) {
       if ( item.skillData.damage != null) {
            item.skillData.cooldown *= 0.8
       }
    }
}