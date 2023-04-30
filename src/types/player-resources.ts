import { ref } from "vue";
import type { PlayerResourcesState } from "./state/wait-state";

export default class PlayerResources {
    gold = 0

    getState(): PlayerResourcesState {
        return {
            gold: this.gold
        }
    }
}