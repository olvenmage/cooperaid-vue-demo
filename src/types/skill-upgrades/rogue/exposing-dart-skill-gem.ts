import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { SleepDart } from "@/types/classes/rogue";

export default class ExposingDartSkillGem extends SkillUpgradeGem {
    public description: string = "The attack that awakes the enemy from sleep dart deals 50% more damage"
    public name = "Exposing Dart"

    public imagePath = "/rogue/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof SleepDart
    }

    applyUpgrade(item: Skill) {
    }
}