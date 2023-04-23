import { createPublishDefinition } from "@/app-socket/lib/core/AppSocketMessageDefinition";
import type BattleState from "@/types/state/battle-state";
import type CharacterState from "@/types/state/character-state";
import type GemSocketingState from "@/types/state/gem-socketing-state";
import type LobbyState from "@/types/state/lobby-state";
import type RewardState from "@/types/state/reward-state";
import type UpgradeGemState from "@/types/state/upgrade-gem-state";

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

const pubUpdatePickRewardState = createPublishDefinition<{
    playerId: string,
    state: RewardState[]
}>('UpdatePickRewardState')

const pubUpdatePickUpgradeGemState = createPublishDefinition<{
    playerId: string,
    state: UpgradeGemState[]
}>('UpdatePickUpgradeGemState')

const pubSetWaitingState = createPublishDefinition<{
    playerId: string,
}>('SetWaitingState')

const pubUpdateGemSocketingState = createPublishDefinition<{
    playerId: string,
    state: GemSocketingState
}>('UpdateGemSocketingState')


export {
    pubUpdatePlayerState,
    pubUpdateBattleState,
    pubUpdateLobbyState,
    pubUpdatePickRewardState,
    pubUpdatePickUpgradeGemState,
    pubSetWaitingState,
    pubUpdateGemSocketingState
}