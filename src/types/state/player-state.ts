import type { PlayerIdentityState } from "./identity-state"

export default interface PlayerState {
    id: string
    name: string
    playerClass: PlayerIdentityState|null
}
