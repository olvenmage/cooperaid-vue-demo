import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { OverwhelmingLight } from "@/types/classes/paladin";

export default class OverwhelmingMartyrdom extends SkillUpgradeGem {
    public description: string = "Overwhelming light now always deals the damage to you instead of the target."
    public name = "Overwhelming Martyrdom"

    public imagePath = "/paladin/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof OverwhelmingLight
    }

    applyUpgrade(item: Skill) {
    }
}