import type UpgradeGemState from "./state/upgarde-gem-state"

export default abstract class UpgradeGem<T> {
    public abstract name: string
    public abstract description: string

    abstract applyUpgrade(item: T): void
    abstract applies(item: T): boolean

    getState(): UpgradeGemState {
        return {
            name: this.name,
            description: this.description
        }
    }
}