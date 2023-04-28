import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { BlessedWeapon } from "@/types/classes/paladin";
import { TargetType } from "../../skill";

export default class WeaponOfRightenousnessSkillGem extends SkillUpgradeGem {
    public description: string = "Blessed Weapon can now only be cast on yourself but adds double the damage."
    public name = "Weapon Of Rightenousness"

    public imagePath = "/paladin/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof BlessedWeapon
    }

    applyUpgrade(item: Skill) {
        item.baseSkillData.targetType = TargetType.TARGET_SELF
    }
}