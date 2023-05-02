import type Character from "@/types/character";
import type Skill from "../../skill";
import SkillUpgradeGem from "../../skill-upgrade";

export default class HealingIncreaseSkillGem extends SkillUpgradeGem {
    public description: string = "Increases healing done by 20%"
    public name = "Basic Healing Upgrade"

    applies(item: Skill): boolean {
        return item.baseSkillData.healing.value > 0
    }

    applyUpgrade(character: Character, item: Skill) {
       if ( item.baseSkillData.healing.value > 0) {
            item.baseSkillData.healing.value = Math.round(item.baseSkillData.healing.value * 1.2)
       }
    }
}