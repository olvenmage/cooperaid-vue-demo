import Game from "@/core/game";
import type Player from "../player";
import GemLootProvider from "../skill-upgrades/gem-loot-provider";
import Reward from "./reward";
import { pubSetWaitingState, pubUpdatePickUpgradeGemState } from "@/client-socket/OutgoingMessages";
import { subChooseUpgradeGem } from "@/client-socket/IncomingMessages";
import type SkillUpgradeGem from "../skill-upgrade";

export default class GemReward extends Reward {
    name: string = "Upgrade Gem"
    description = "Choose an Upgrade Gem for one of your skills"
    imagePath = "/rewards/gem-reward.png"
    
    onChosen(player: Player): Promise<void> {
        const gems = GemLootProvider.getUpgradeGemOptions(player, 3) as SkillUpgradeGem[]

        return new Promise((resolve, reject) => {
            Game.webSocket.publish(pubUpdatePickUpgradeGemState({
                playerId: player.id,
                state: gems.map((gem) => gem.getState(player))
            }))

            const updateGemsInterval = setInterval(() => {
                Game.webSocket.publish(pubUpdatePickUpgradeGemState({
                    playerId: player.id,
                    state: gems.map((gem) => gem.getState(player))
                }))
            }, 2000)
           

            const chooseGemSubscription = Game.webSocket.subscribe(subChooseUpgradeGem, (event) => {
                const chosenGem = gems.find((gem) => gem.name == event.body.gemName)
                if (!chosenGem) {
                    return;
                }

                chooseGemSubscription.unsubscribe()
                player.inventory.addGem(chosenGem)
                player.state.choosingReward = false
                clearInterval(updateGemsInterval)
               
                Game.webSocket.publish(pubSetWaitingState({
                    playerId: player.id,
                }))

                resolve()
            })  
        })
    }
}