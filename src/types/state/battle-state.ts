import type CharacterState from "./character-state"

export default interface BattleState {
    enemies: CharacterState[]
    allies: CharacterState[]
    self: CharacterState
}