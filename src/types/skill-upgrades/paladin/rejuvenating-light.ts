import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { LayOnHands, OverwhelmingLight } from "@/types/classes/paladin";

export default class RejuvenatingLight extends SkillUpgradeGem {
    public description: string = "Lay on Hands now also restores 2 energy to target"
    public name = "Rejuvenating Light"

    public imagePath = "/gems/paladin/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof LayOnHands
    }

    applyUpgrade(item: Skill) {
    }
}