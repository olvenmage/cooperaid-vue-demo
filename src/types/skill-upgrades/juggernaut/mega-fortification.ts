import { Fortify, ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";
import { TargetType } from "../../skill";

export default class MegaFortificationSkillGem extends SkillUpgradeGem {
    public description: string = "Fortify now gives two armor but has a longer cooldown and costs 2 more energy."
    public name = "Mega Fortification"

    public imagePath = "/juggernaut/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof Fortify
    }

    applyUpgrade(item: Skill) {
        item.skillData.cooldown += 6 * 1000
        item.skillData.energyCost += 2
    }
}