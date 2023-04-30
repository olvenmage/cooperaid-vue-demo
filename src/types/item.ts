import Character from "./character"
import type Identity from "./identity"
import type Player from "./player"
import type Skill from "./skill"
import type ItemState from "./state/item-state"
import type UpgradeGemState from "./state/upgrade-gem-state"

export default abstract class Item {
    public id = "item" + Math.random().toString(16).slice(2)
    public abstract name: string
    public abstract description: string
    public abstract goldValue: number

    imagePath: string|null = null

    getItemState(playerClass: Identity|null): ItemState {
       return {
            id: this.id,
            name: this.name,
            description: this.description,
            goldValue: this.goldValue,
            imagePath: this.getImagePath(playerClass)
       }
    }

    getImagePath(playerClass: Identity|null): string|null {
       return this.imagePath
    }
}