import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import type Character from "@/types/character";

export default class ShieldBlockAlliesSkillGem extends SkillUpgradeGem {
    public description: string = "Allows Shield Block to be cast on allies"
    public name = "Guarding Shield Block"

    public imagePath = "/gems/juggernaut/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof ShieldBlock
    }

    applyUpgrade(character: Character, item: Skill) {
       item.baseSkillData.targetType = TargetType.TARGET_FRIENDLY
    }
}