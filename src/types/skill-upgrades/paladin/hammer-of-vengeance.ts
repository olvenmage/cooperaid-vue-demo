import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { BlessedWeapon, HammerOfJustice } from "@/types/classes/paladin";
import { TargetType } from "../../skill";
import type Character from "@/types/character";

export default class HammerOfVengeanceSkillGem extends SkillUpgradeGem {
    public description: string = "Hammer of Justice now reduces the enemy's armor and magical armor by 2 during the debuff."
    public name = "Hammer of Vengeneance"

    public imagePath = "/gems/paladin/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof HammerOfJustice
    }

    applyUpgrade(character: Character, item: Skill) {
    }
}