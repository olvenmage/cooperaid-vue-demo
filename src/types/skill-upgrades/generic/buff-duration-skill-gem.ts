import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class BuffDurationSkillGem extends SkillUpgradeGem {
    public description: string = "Increases Buff duration by 20%"
    public name = "Basic Buff Duration Upgrade"

    applies(item: Skill): boolean {
        return item.skillData.buffDuration > 0
    }

    applyUpgrade(item: Skill) {
       if ( item.skillData.damage != null) {
            item.skillData.buffDuration *= 1.2
       }
    }
}