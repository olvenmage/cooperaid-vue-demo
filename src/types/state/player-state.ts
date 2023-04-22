import type { CharacterSkill } from "@/client-socket/types/character-state"
import type { PlayerIdentityState } from "./identity-state"

export default interface PlayerState {
    id: string
    name: string
    playerClass: PlayerIdentityState|null
    basicSkill: CharacterSkill|null
}
