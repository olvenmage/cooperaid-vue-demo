import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { OverwhelmingLight } from "@/types/classes/paladin";
import { Rampage } from "@/types/classes/barbarian";

export default class BloodthirstyRampage extends SkillUpgradeGem {
    public description: string = "Rampage now has 30% lifesteal"
    public name = "Bloodthirsty Rampage"

    public imagePath = "/gems/barbarian/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof Rampage
    }

    applyUpgrade(item: Skill) {
    }
}