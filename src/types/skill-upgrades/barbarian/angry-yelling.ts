import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { OverwhelmingLight } from "@/types/classes/paladin";
import { Rampage, Shout } from "@/types/classes/barbarian";
import type Character from "@/types/character";

export default class AngryYellingSkillGem extends SkillUpgradeGem {
    public description: string = "Shout generates 2 rage per enemy affected"
    public name = "Angry Yelling"

    public imagePath = "/gems/barbarian/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof Shout
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}