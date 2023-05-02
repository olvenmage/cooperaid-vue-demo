import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { FanOfKnives, ShadowStep, SleepDart } from "@/types/classes/rogue";
import type Character from "@/types/character";

export default class ShadowSurge extends SkillUpgradeGem {
    public description: string = "Every skill you interupt with Shadowstep grants 1 energy."
    public name = "Shadow Surge"

    public imagePath = "/gems/rogue/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof ShadowStep
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}