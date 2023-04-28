import Game from "@/core/game";
import type Player from "./player";
import { pubUpdateExpGainedState } from "@/client-socket/OutgoingMessages";
import { subAckExpGained, subSocketGemIntoSkill, subStartSocketing, subStopSocketing } from "@/client-socket/IncomingMessages";
import type { AppSocketSubscription } from "@/app-socket/lib/core/types";

export default class PlayerLevelup {
    active = false

    ackExpGainedSubscription: AppSocketSubscription|null = null

    constructor(private player: Player) {

    }

    publishExpGainedState() {
        if (!this.active || !this.player.expBar.lastExpGainedResult) {
            console.log(`ac: ${this.active}`)
            return
        }

        Game.webSocket.publish(pubUpdateExpGainedState({
            playerId: this.player.id,
            state: this.player.expBar.lastExpGainedResult
        }))
    }

    startListening(): this {
        this.ackExpGainedSubscription = Game.webSocket.subscribe(subAckExpGained, (event) => {
            if (event.body.playerId != this.player.id) return;
            this.acknowledgeExpGained()

            console.log(Game.players.value.map((p) => p.state.expGained.active));

            if (!Game.players.value.some((player) => player.state.expGained.active)) {
                console.log("automatically continueing!")
                Game.nextEncounter()
            }
        })

        return this
    }

    acknowledgeExpGained() {
        this.active = false;
    }
}