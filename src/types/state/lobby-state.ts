import type CharacterState from "./character-state";
import type IdentityState from "./identity-state";
import type PlayerState from "./player-state";

export default interface LobbyState {
    availableClasses: IdentityState[],
    players: PlayerState[]
}

