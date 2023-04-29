import { BodyGuard, ShieldBlock } from "@/types/classes/juggernaut";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class WingManSkillGem extends SkillUpgradeGem {
    public description: string = "Body Guard now also gives the ally +20% damage done for the duration"
    public name = "Guarding Shield Block"

    public imagePath = "/juggernaut/uncommon.png"

    applies(item: Skill): boolean {
        return item instanceof BodyGuard
    }

    applyUpgrade(item: Skill) {
    }
}