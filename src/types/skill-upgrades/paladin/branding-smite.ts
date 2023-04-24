import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { Smite } from "@/types/classes/paladin";

export default class BrandingSmiteSkillGem extends SkillUpgradeGem {
    public description: string = "Smite now deals damage when the target is hit intead of healing the attacker"
    public name = "Branding Smite"

    public imagePath = "/paladin/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof Smite
    }

    applyUpgrade(item: Skill) {
    }
}