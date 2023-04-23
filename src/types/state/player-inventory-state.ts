import type { CharacterSkill } from "@/client-socket/types/character-state"
import type { PlayerIdentityState } from "./identity-state"
import type UpgradeGem from "../upgrade"
import type UpgradeGemState from "./upgrade-gem-state"

export default interface PlayerInventoryState {
    skillGems: UpgradeGemState[]
}
