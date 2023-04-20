import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";

export default class ShieldBlockAlliesSkillGem extends SkillUpgradeGem {
    public description: string = "Allows Shield Block to be cast on allies"
    public name = "Shield Block Allies Upgrade"

    applies(item: Skill): boolean {
        return item instanceof ShieldBlock
    }

    applyUpgrade(item: Skill) {
       item.skillData.targetType = TargetType.TARGET_FRIENDLY
    }
}