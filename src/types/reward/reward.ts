import type Player from "../player";
import type RewardState from "../state/reward-state";

export default abstract class Reward {
    abstract name: string
    abstract description: string
    abstract imagePath: string|null
    abstract onChosen(player: Player): Promise<void>

    getState(): RewardState {
        return {
            name: this.name,
            description: this.description,
            imagePath: this.imagePath
        }
    }
}