import { BodyGuard, ShieldBlock, ShieldShatter } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import type Character from "@/types/character";

export default class ForcefulShieldShatterSkillGem extends SkillUpgradeGem {
    public description: string = "Shield shatter is now affected by Attack Damage"
    public name = "Forceful Shield Shatter"

    public imagePath = "/gems/juggernaut/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof ShieldShatter
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}