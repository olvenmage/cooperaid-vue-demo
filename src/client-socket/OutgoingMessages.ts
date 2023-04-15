import { createSubscribeDefinition } from "@/app-socket/lib/core/AppSocketMessageDefinition";
import type BattleState from "@/types/state/battle-state";
import type CharacterState from "@/types/state/character-state";

const pubUpdatePlayerState = createSubscribeDefinition<{
    playerId: string,
    state: CharacterState
}>('UpdatePlayerState')

const pubUpdateBattleState = createSubscribeDefinition<{
    playerId: string,
    state: BattleState
}>('UpdateBattleState')

export {
    pubUpdatePlayerState,
    pubUpdateBattleState
}