import Game from "@/core/game";
import type Player from "./player";
import { pubSetWaitingState, pubUpdatePlayerStatsState } from "@/client-socket/OutgoingMessages";
import { subAssignSkillPoint,subStartUpdatingStats, subStopUpdatingStats } from "@/client-socket/IncomingMessages";
import type { AppSocketSubscription } from "@/app-socket/lib/core/types";
import CharacterStats from "./character-stats";
import GameSettings from "@/core/settings";

export default class PlayerStateStats {
    active = false

    stopUpdatingStatsSubscription: AppSocketSubscription|null = null
    assignStatPointSubscription: AppSocketSubscription|null = null

    constructor(private player: Player) {

    }

    publishUpdatePlayerStatsState() {
        if (!this.active) {
            return
        }

        const playerStats = new CharacterStats(this.player.coreStats)

        Game.webSocket.publish(pubUpdatePlayerStatsState({
            playerId: this.player.id,
            state: {
                core: playerStats.core.getState(),
                derived: playerStats.derived.getState(),
                config: GameSettings.derivedStatsOptions,
                statPoints: this.player.statPoints
            }
        }))
    }

    startListening(): this {
        Game.webSocket.subscribe(subStartUpdatingStats, (event) => {
            if (event.body.playerId != this.player.id) return

            this.startUpdating()

            this.stopUpdatingStatsSubscription = Game.webSocket.subscribe(subStopUpdatingStats, (event) => {
                if (event.body.playerId != this.player.id) return;
                this.stopUpdatingStats()
            })
        })

        return this
    }

    startUpdating() {
        this.active = true;

        this.assignStatPointSubscription = Game.webSocket.subscribe(subAssignSkillPoint, (event) => {
            if (event.body.playerId != this.player.id || !this.active) return

            if (this.player.statPoints <= 0) {
                return;
            }

            switch(event.body.stat) {
                case 'dexterity': 
                    this.player.coreStats.dexterity.set(this.player.coreStats.dexterity.value + 1)
                    break;
                case 'constitution': 
                    this.player.coreStats.constitution.set(this.player.coreStats.constitution.value + 1)
                    break;
                case 'strength': 
                    this.player.coreStats.strength.set(this.player.coreStats.strength.value + 1)
                    break;
                case 'intelligence': 
                    this.player.coreStats.intelligence.set(this.player.coreStats.intelligence.value + 1)
                    break;
                default:
                    console.log("niks dus.")
                    return
            }

            this.player.statPoints -= 1;
        })
    }

    stopUpdatingStats() {
        this.stopUpdatingStatsSubscription?.unsubscribe()
        this.stopUpdatingStatsSubscription = null

        this.assignStatPointSubscription?.unsubscribe()
        this.assignStatPointSubscription = null

        if (this.active) {
            Game.webSocket.publish(pubSetWaitingState({
                playerId: this.player.id,
                state: this.player.getWaitState()
            }))
        }
    
        this.active = false;
    }
}