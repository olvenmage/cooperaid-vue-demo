import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { FanOfKnives, SleepDart } from "@/types/classes/rogue";

export default class KnifeStormSkillGem extends SkillUpgradeGem {
    public description: string = "Deals 3 extra damage and divides it amongst 2 extra daggers but randomly targets enemies"
    public name = "Knife Storm"

    public imagePath = "/rogue/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof FanOfKnives
    }

    applyUpgrade(item: Skill) {
        item.baseSkillData.damage += 3
        item.baseSkillData.targetType = TargetType.TARGET_ALL_ENEMIES
    }
}