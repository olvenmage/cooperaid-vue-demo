import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { CoughBomb, FanOfKnives, ShadowStep, SleepDart } from "@/types/classes/rogue";

export default class ToxicBombsSkillGem extends SkillUpgradeGem {
    public description: string = "Cough Bomb now applies three stacks of poison"
    public name = "Toxic Bombs"

    public imagePath = "/rogue/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof CoughBomb
    }

    applyUpgrade(item: Skill) {
    }
}