import type Player from "./player";
import type SkillUpgradeGem from "./skill-upgrade";
import type PlayerInventoryState from "./state/player-inventory-state";

export default class PlayerInventory {
    skillGems: SkillUpgradeGem[] = []

    addGem(gem: SkillUpgradeGem) {
        this.skillGems.push(gem)
    }

    getState(player: Player): PlayerInventoryState {
        return {
            skillGems: this.skillGems.map((gem) => gem.getState(player))
        }
    }
}