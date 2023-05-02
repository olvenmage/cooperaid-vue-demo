import type Character from "@/types/character";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class BuffDurationSkillGem extends SkillUpgradeGem {
    public description: string = "Increases Buff duration by 20%"
    public name = "Basic Buff Duration Upgrade"

    applies(item: Skill): boolean {
        return item.baseSkillData.buffDuration > 0
    }

    applyUpgrade(character: Character, item: Skill) {
       if ( item.baseSkillData.damage != null) {
            item.baseSkillData.buffDuration *= 1.2
       }
    }
}