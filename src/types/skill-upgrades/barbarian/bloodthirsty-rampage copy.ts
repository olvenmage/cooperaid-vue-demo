import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { OverwhelmingLight } from "@/types/classes/paladin";
import { EnragingBlow } from "@/types/classes/barbarian";

export default class RagingBlowSkillGem extends SkillUpgradeGem {
    public description: string = "Enraging Blow now deals 50% more damage while raging."
    public name = "Raging Blow"

    public imagePath = "/barbarian/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof EnragingBlow
    }

    applyUpgrade(item: Skill) {
    }
}