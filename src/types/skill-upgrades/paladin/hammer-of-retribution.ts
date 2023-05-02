import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { BlessedWeapon, HammerOfJustice } from "@/types/classes/paladin";
import { TargetType } from "../../skill";
import type Character from "@/types/character";

export default class HammerOfRetributionSkillGem extends SkillUpgradeGem {
    public description: string = "Hammer of Justice now counts damage done by allies."
    public name = "Hammer of Retribution"

    public imagePath = "/gems/paladin/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof HammerOfJustice
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}