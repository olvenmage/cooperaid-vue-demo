import type ItemState from "./item-state"
import type PlayerInventoryState from "./player-inventory-state"
import type WaitState from "./wait-state"

export default interface ShoppingState {
    shopInventory: ItemState[],
    inventory: PlayerInventoryState,
    waitState: WaitState,
}
