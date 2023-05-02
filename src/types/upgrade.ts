import type Character from "./character"
import type Identity from "./identity"
import Item from "./item"
import type Player from "./player"
import type Skill from "./skill"
import type UpgradeGemState from "./state/upgrade-gem-state"

export default abstract class UpgradeGem<T> extends Item {
    public id = "gem" + Math.random().toString(16).slice(2)
    public abstract name: string
    public abstract description: string
    public goldValue: number = 10

    abstract applyUpgrade(character: Character, item: T): void
    abstract applies(item: T): boolean

    imagePath: string|null = null

    getState(playerClass: Identity|null, skills: Skill[]): UpgradeGemState {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            imagePath: this.getImagePath(playerClass),
            appliesTo: skills.filter((sk) => this.applies(sk)).map((sk) => sk.id),
            goldValue: this.goldValue
        }
    }

    override getImagePath(playerClass: Identity|null): string|null {
        if (this.imagePath) {
            return this.imagePath
        }

        return `/gems/${playerClass?.name.toLocaleLowerCase()}/basic.png`
    }
}