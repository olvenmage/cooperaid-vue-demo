import type Character from "../character";
import Skill, { AiTargetting, TargetType } from "../skill";

export default class Taunt extends Skill {
    name: string = "Taunt";
    energyCost: number = 3;
    cooldown: number = 6 * 1000;
    castTime = 500
    targetType: TargetType = TargetType.TARGET_ENEMY
    aiTargetting = AiTargetting.RANDOM
    imagePath = "/neutral/taunt.png"

    BASE_DAMAGE = 3

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.raiseThreat(castBy, castBy.healthBar.max / 1.5))
    }
}