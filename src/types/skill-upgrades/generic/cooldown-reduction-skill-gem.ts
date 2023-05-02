import type Character from "@/types/character";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class CooldownReductionSkillGem extends SkillUpgradeGem {
    public description: string = "Reduces cooldown by 20%"
    public name = "Basic Cooldown Reduction Upgrade"

    applies(item: Skill): boolean {
        return item.baseSkillData.cooldown > 0
    }

    applyUpgrade(character: Character, item: Skill) {
       if ( item.baseSkillData.damage != null) {
            item.baseSkillData.cooldown *= 0.8
       }
    }
}