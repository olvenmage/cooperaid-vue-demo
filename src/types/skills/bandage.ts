import PoisonBuff from "../buffs/poison";
import type Character from "../character";
import Skill, { AiTargetting, TargetType } from "../skill";

export default class Bandage extends Skill {
    name: string = "Bandage";
    energyCost: number = 3;
    cooldown: number = 4 * 1000;
    castTime = 2000
    targetType: TargetType = TargetType.TARGET_FRIENDLY
    aiTargetting = AiTargetting.RANDOM
    imagePath = "/neutral/bandage.png"

    override interuptsOnDamageTaken = true

    BASE_DAMAGE = 3

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.restoreHealth(6, castBy, 0.6)
            target.buffs.removeBuffByType(PoisonBuff)
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}