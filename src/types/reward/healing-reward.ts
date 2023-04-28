import Game from "@/core/game";
import type Player from "../player";
import Reward from "./reward";
import { pubSetWaitingState } from "@/client-socket/OutgoingMessages";

export default class HealingReward extends Reward {
    name: string = "Heal"
    description = "Restore 60% of your max health"
    imagePath = "/rewards/heal-reward.png"
    
    onChosen(player: Player): Promise<void> {
        player.healthBar.increase(Math.round(player.healthBar.max * 0.6))

        if (player.combatCharacter) {
            player.combatCharacter.dead = false
        }

        Game.webSocket.publish(pubSetWaitingState({
            playerId: player.id,
            state: player.getWaitState(),
        }))

        return new Promise((reject, resolve) => resolve())
    }
}