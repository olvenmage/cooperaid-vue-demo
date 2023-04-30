import type Item from "./item";
import type Player from "./player";
import SkillInventoryItem from "./skill-inventory-item";
import SkillUpgradeGem from "./skill-upgrade";
import type PlayerInventoryState from "./state/player-inventory-state";

export default class PlayerInventory {
    skillGems: SkillUpgradeGem[] = []
    skills: SkillInventoryItem[] = []

    addGem(gem: SkillUpgradeGem) {
        this.skillGems.push(gem)
    }

    addItem(item: Item) {
       this.getCollectionForItem(item).push(item)
    }


    removeItem(item: Item) {
        const collection = this.getCollectionForItem(item)

        const index = collection.findIndex((i) => i.id == item.id)

        if (index != -1) {
            collection.splice(index, 1)
        }
     }

     getItemById(id: string): Item|null {
        return this.getJoinedCollection().find((item) => item.id == id) ?? null
     }

    getState(player: Player): PlayerInventoryState {
        return {
            skillGems: this.skillGems.map((gem) => gem.getState(player.playerClass, player.allSkills))
        }
    }

    private getJoinedCollection(): Item[] {
        return [
            ...this.skills,
            ...this.skillGems
        ]
    }

    private getCollectionForItem(item: Item): Item[] {
        if (item instanceof SkillUpgradeGem) {
            return this.skillGems
        } else if (item instanceof SkillInventoryItem) {
            return this.skills
        } else {
            console.error("Item not configured for player inventory.")
            return []
        }
    }
}