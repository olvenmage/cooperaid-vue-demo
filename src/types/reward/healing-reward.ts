import Game from "@/core/game";
import type Player from "../player";
import Reward from "./reward";
import { pubSetWaitingState } from "@/client-socket/OutgoingMessages";

export default class HealingReward extends Reward {
    name: string = "Heal"
    description = "Restore 60% of your max health"
    imagePath = "/rewards/heal-reward.png"
    
    onChosen(player: Player): Promise<void> {
        player.healthBar.increase(player.healthBar.max * 0.6)

        Game.webSocket.publish(pubSetWaitingState({
            playerId: player.id,
        }))

        return new Promise((reject, resolve) => resolve())
    }
}