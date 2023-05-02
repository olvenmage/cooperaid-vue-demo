import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { FanOfKnives, SleepDart } from "@/types/classes/rogue";
import type Character from "@/types/character";

export default class KnifeStormSkillGem extends SkillUpgradeGem {
    public description: string = "Deals +20% dexterity extra damage and divides it amongst 2 extra daggers but randomly targets enemies"
    public name = "Knife Storm"

    public imagePath = "/gems/rogue/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof FanOfKnives
    }

    applyUpgrade(character: Character, item: Skill) {
        item.baseSkillData.damage.modifiedBy('dexterity', 0.2)
        item.baseSkillData.targetType = TargetType.TARGET_ALL_ENEMIES
    }
}