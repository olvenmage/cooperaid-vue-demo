import type Skill from "../skill";
import SkillUpgrade from "../skill-upgrade";

export default class SkillDamageUpgrade extends SkillUpgrade {
    public description: string = "Increases damage dealt by 20%"
    public name = "Basic Damage Upgrade"

    applies(item: Skill): boolean {
        return item.skillData.damage != null
    }

    applyUpgrade(item: Skill) {
       if ( item.skillData.damage != null) {
            item.skillData.damage *= 1.2
       }
    }
}