import { createPublishDefinition } from "@/app-socket/lib/core/AppSocketMessageDefinition";
import type BattleState from "@/types/state/battle-state";
import type CharacterState from "@/types/state/character-state";
import type LobbyState from "@/types/state/lobby-state";

const pubUpdatePlayerState = createPublishDefinition<{
    playerId: string,
    state: CharacterState
}>('UpdatePlayerState')

const pubUpdateBattleState = createPublishDefinition<{
    playerId: string,
    state: BattleState
}>('UpdateBattleState')

const pubUpdateLobbyState = createPublishDefinition<{
    playerId: string,
    state: LobbyState
}>('UpdateLobbyState')

export {
    pubUpdatePlayerState,
    pubUpdateBattleState,
    pubUpdateLobbyState
}