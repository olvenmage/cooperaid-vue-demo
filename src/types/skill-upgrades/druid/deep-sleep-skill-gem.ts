import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";
import { Regrowth } from "@/types/classes/druid";
import type Character from "@/types/character";

export default class DeepSleepSkillGem extends SkillUpgradeGem {
    public description: string = "Hibernate now doesnt break on damage"
    public name = "Deep Sleep"

    public imagePath = "/gems/druid/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof Regrowth
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}