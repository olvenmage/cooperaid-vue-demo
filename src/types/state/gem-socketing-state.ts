import type { CharacterSkill } from "./character-state"
import type PlayerInventoryState from "./player-inventory-state"

export default interface GemSocketingState {
    basicSkill: CharacterSkill,
    skills: CharacterSkill[],
    inventory: PlayerInventoryState
}
