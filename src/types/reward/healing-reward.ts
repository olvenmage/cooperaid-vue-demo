import type Player from "../player";
import Reward from "./reward";

export default class HealingReward extends Reward {
    name: string = "Heal"
    description = "Restore 40% of your max health"
    imagePath = "/rewards/heal-reward.png"
    
    onChosen(player: Player): Promise<void> {
        player.healthBar.increase(player.healthBar.max * 0.4)

        return new Promise((reject, resolve) => resolve())
    }
}