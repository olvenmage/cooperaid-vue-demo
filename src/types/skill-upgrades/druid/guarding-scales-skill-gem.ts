import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { ProtectiveScales, Regrowth } from "@/types/classes/druid";
import type Character from "@/types/character";

export default class GuardingScalesSkillGem extends SkillUpgradeGem {
    public description: string = "Protective scales now gives a stacking armor and magical armor buff while it isn't triggered."
    public name = "Guarding Scales"

    public imagePath = "/gems/druid/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof ProtectiveScales
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}