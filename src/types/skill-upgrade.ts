import type Character from "./character";
import type Skill from "./skill";
import type SkillData from "./skill-data";
import UpgradeGem from "./upgrade";

export default abstract class SkillUpgradeGem extends UpgradeGem<Skill> {
    onCast(castBy: Character, targets: Character[], skillData: SkillData) {
        
    }
}