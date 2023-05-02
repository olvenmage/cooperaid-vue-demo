import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { HolyStrike, OverwhelmingLight } from "@/types/classes/paladin";
import type Character from "@/types/character";

export default class FinishingStrikeSkilGem extends SkillUpgradeGem {
    public description: string = "Holy strike heals for tripple the amount if it's the last hit on the target."
    public name = "Finishing Strike"

    public imagePath = "/gems/paladin/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof HolyStrike
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}