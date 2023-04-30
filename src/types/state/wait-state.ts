export interface PlayerResourcesState {
    gold: number
}

export default interface WaitState {
    skillPoints: number
    resources: PlayerResourcesState
}
