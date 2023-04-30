import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { OverwhelmingLight } from "@/types/classes/paladin";
import { BloodLust, Rampage } from "@/types/classes/barbarian";

export default class BloodBerserkSkillGem extends SkillUpgradeGem {
    public description: string = "Blood Lust can now crit and makes the attack you do with it have +10% crit"
    public name = "Blood Beserk"

    public imagePath = "/gems/barbarian/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof BloodLust
    }

    applyUpgrade(item: Skill) {
    }
}