import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";

export default class DurableShieldBlockSkillGem extends SkillUpgradeGem {
    public description: string = "Shield Block can now take two hits before breaking"
    public name = "Durable Shield Block"

    public imagePath = "/gems/juggernaut/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof ShieldBlock
    }

    applyUpgrade(item: Skill) {
    }
}