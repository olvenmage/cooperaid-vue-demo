import Character from "./character"
import type Identity from "./identity"
import type Player from "./player"
import type Skill from "./skill"
import type UpgradeGemState from "./state/upgrade-gem-state"

export default abstract class UpgradeGem<T> {
    public id = "gem" + Math.random().toString(16).slice(2)
    public abstract name: string
    public abstract description: string

    abstract applyUpgrade(item: T): void
    abstract applies(item: T): boolean

    imagePath: string|null = null

    getState(playerClass: Identity|null, skills: Skill[]): UpgradeGemState {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            imagePath: this.getImagePath(playerClass),
            appliesTo: skills.filter((sk) => this.applies(sk)).map((sk) => sk.id)
        }
    }

    getImagePath(playerClass: Identity|null): string|null {
        if (this.imagePath) {
            return this.imagePath
        }

        return `/${playerClass?.name.toLocaleLowerCase()}/basic.png`
    }
}