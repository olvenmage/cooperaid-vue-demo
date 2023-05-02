import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { CoughBomb, FanOfKnives, ShadowStep, SleepDart } from "@/types/classes/rogue";
import type Character from "@/types/character";

export default class ToxicBombsSkillGem extends SkillUpgradeGem {
    public description: string = "Cough Bomb now applies three stacks of poison"
    public name = "Toxic Bombs"

    public imagePath = "/gems/rogue/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof CoughBomb
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}