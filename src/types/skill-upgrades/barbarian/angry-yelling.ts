import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { OverwhelmingLight } from "@/types/classes/paladin";
import { Rampage, Shout } from "@/types/classes/barbarian";

export default class AngryYellingSkillGem extends SkillUpgradeGem {
    public description: string = "Shout generates 1 rage per enemy affected"
    public name = "Angry Yelling"

    public imagePath = "/barbarian/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof Shout
    }

    applyUpgrade(item: Skill) {
    }
}