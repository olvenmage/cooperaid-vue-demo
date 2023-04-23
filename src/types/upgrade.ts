import Character from "./character"
import type Player from "./player"
import type UpgradeGemState from "./state/upgrade-gem-state"

export default abstract class UpgradeGem<T> {
    public abstract name: string
    public abstract description: string

    abstract applyUpgrade(item: T): void
    abstract applies(item: T): boolean

    imagePath: string|null = null

    getState(player: Player): UpgradeGemState {
        return {
            name: this.name,
            description: this.description,
            imagePath: this.getImagePath(player)
        }
    }

    getImagePath(player: Player): string|null {
        if (this.imagePath) {
            return this.imagePath
        }

        return `/${player.playerClass?.name.toLocaleLowerCase()}/basic.png`
    }
}