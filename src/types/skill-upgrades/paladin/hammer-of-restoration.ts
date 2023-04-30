import { ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { BlessedWeapon, HammerOfJustice } from "@/types/classes/paladin";
import { TargetType } from "../../skill";

export default class HammerOfRestorationSkillGem extends SkillUpgradeGem {
    public description: string = "Hammer of Justice now restores the lowest health ally by 40% of the damage dealt during the debuff."
    public name = "Hammer of Restoration"

    public imagePath = "/gems/paladin/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof HammerOfJustice
    }

    applyUpgrade(item: Skill) {
    }
}