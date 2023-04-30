import Game from "@/core/game";
import type Player from "../player";
import Reward from "./reward";
import { pubSetWaitingState } from "@/client-socket/OutgoingMessages";

export default class RessurectReward extends Reward {
    name: string = "Ressurect"
    description = "Come back to life at full health"
    imagePath = "/rewards/heal-reward.png"
    
    onChosen(player: Player): Promise<void> {
        player.healthBar.increase(10000)

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