import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { SleepDart } from "@/types/classes/rogue";
import type Character from "@/types/character";

export default class ParalyzingDartSkillGem extends SkillUpgradeGem {
    public description: string = "Sleep Dart now also reduces energy regen speed by 50% on the target"
    public name = "Paralyzing Dart"

    public imagePath = "/gems/rogue/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof SleepDart
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}