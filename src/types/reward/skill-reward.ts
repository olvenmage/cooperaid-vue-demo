import type Player from "../player";
import GemLootProvider from "../skill-upgrades/gem-loot-provider";
import Reward from "./reward";

export default class SkillReward extends Reward {
    name: string = "Skill"
    description = "Choose a new skill to learn"
    imagePath = "/rewards/new-skill-reward.png"
    
    onChosen(player: Player): Promise<void> {
        const gems = GemLootProvider.getUpgradeGemOptions(player, 3)

        // todo send gem option
    }
}