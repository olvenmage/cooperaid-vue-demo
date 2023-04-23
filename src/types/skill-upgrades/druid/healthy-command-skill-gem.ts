import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { CommandNature } from "@/types/classes/druid";

export default class HealthyCommandNatureSkillGem extends SkillUpgradeGem {
    public description: string = "Command Nature now restores 3 health per stack when it expires."
    public name = "Healthy Command"

    public imagePath = "/druid/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof CommandNature
    }

    applyUpgrade(item: Skill) {
    }
}