import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { Dismantle } from "@/types/classes/rogue";

export default class NullifyingDismantleSkillGem extends SkillUpgradeGem {
    public description: string = "Dismantle now also removes magical amror"
    public name = "Nulifying Dismantlet"

    public imagePath = "/rogue/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof Dismantle
    }

    applyUpgrade(item: Skill) {
    }
}