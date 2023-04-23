import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { SleepDart } from "@/types/classes/rogue";

export default class ParalyzingDartSkillGem extends SkillUpgradeGem {
    public description: string = "Sleep Dart now also reduces speed by 50% on the target"
    public name = "Paralyzing Dart"

    public imagePath = "/rogue/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof SleepDart
    }

    applyUpgrade(item: Skill) {
    }
}