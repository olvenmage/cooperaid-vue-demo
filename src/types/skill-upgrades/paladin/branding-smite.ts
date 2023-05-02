import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { Smite } from "@/types/classes/paladin";
import type Character from "@/types/character";

export default class BrandingSmiteSkillGem extends SkillUpgradeGem {
    public description: string = "Smite now deals 6 damage instead of healing for 2 when the enemy is hit"
    public name = "Branding Smite"

    public imagePath = "/gems/paladin/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof Smite
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}