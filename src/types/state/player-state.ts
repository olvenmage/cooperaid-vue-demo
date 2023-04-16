import type IdentityState from "./identity-state"

export default interface PlayerState {
    id: string
    name: string
    playerClass: IdentityState|null
}
