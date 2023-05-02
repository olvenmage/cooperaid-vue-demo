import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { Evasion, SleepDart } from "@/types/classes/rogue";
import type Character from "@/types/character";

export default class QuickMovesSkillGem extends SkillUpgradeGem {
    public description: string = "Evasion now grants a stacking speed buff every time you succesfully dodge an attack."
    public name = "Quick Moves"

    public imagePath = "/gems/rogue/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof Evasion
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}