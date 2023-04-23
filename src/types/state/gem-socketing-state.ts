import type { CharacterSkill } from "./character-state"
import type PlayerInventoryState from "./player-inventory-state"

export default interface GemSocketingState {
    skills: CharacterSkill[],
    inventory: PlayerInventoryState
}
