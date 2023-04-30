import type ItemState from "./item-state"

export default interface UpgradeGemState extends ItemState {
    appliesTo: string[]
}
