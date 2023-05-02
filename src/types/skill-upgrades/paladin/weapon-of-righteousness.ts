import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { BlessedWeapon } from "@/types/classes/paladin";
import { TargetType } from "../../skill";
import type Character from "@/types/character";

export default class WeaponOfRightenousnessSkillGem extends SkillUpgradeGem {
    public description: string = "Blessed Weapon can now only be cast on yourself but adds double the damage."
    public name = "Weapon Of Rightenousness"

    public imagePath = "/gems/paladin/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof BlessedWeapon
    }

    applyUpgrade(character: Character, item: Skill) {
        item.baseSkillData.targetType = TargetType.TARGET_SELF
    }
}