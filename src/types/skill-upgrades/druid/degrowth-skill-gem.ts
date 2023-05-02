import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { Regrowth } from "@/types/classes/druid";
import type Character from "@/types/character";

export default class DegrowthSkillGem extends SkillUpgradeGem {
    public description: string = "Allows Regrowth to be cast on enemies and deal damage instead of healing"
    public name = "Degrowth"

    public imagePath = "/gems/druid/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof Regrowth
    }

    applyUpgrade(character: Character, item: Skill) {
       item.baseSkillData.targetType = TargetType.TARGET_ANY
    }
}