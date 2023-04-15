import type Enemy from "@/types/enemy";
import type Player from "@/types/player";
import Battle, { type CombatFinishedParameters } from "./battle";
import { EventBus } from "ts-bus";
import { reactive } from "vue";
import type Encounter from "./encounter";
import type { AppSocket } from "@/app-socket/lib/core/types";
import presenterSocket from '../client-socket/presenter-socket'
import { pubUpdatePlayerState } from "@/client-socket/OutgoingMessages";

interface StartGameParams {
    players: Player[],
    route: Encounter[]
}

export default abstract class Game {
    static currentBattle: Battle|null = null
    static eventBus = new EventBus()
    static players: Player[] = []
    static webSocket: AppSocket = presenterSocket
    private static route: Encounter[]
    static isGameover = false
    static inShop = false

    private static onCombatChangedListeners: (() => void)[] = []
    private static onShopChangedListeners: (() => void)[] = []
    private static onGameoverListeners: (() => void)[] = []

    static get inCombat(): boolean {
        return this.currentBattle != null
    }

    static async startGame(params: StartGameParams): Promise<void> {
        this.players = params.players.map((char) => reactive(char)) as Player[]
        this.route = params.route

        for (const encounter of this.route) {
            const success = await encounter.startEncounter()

            if (!success) {
                return
            }
        }
    }

    static joinPlayer(playerClass: string, playerId: string) {
        const player = this.players.find((plr) => plr.identity.name == playerClass)
        
        if (!player) {
            console.error(`Player with class ${playerClass} cant join`)
            return
        }   

        console.log("PLAYER JOINED!")
        player.id = playerId
        player.connectedExternally = true
    }

    static updatePlayerState(player: Player) {
        if (!player.connectedExternally) {
            return
        }

        presenterSocket.publish(pubUpdatePlayerState ({
            playerId: player.id,
            state: player.getState()
        }))
    }

    static getPlayer(playerId: string): Player|null {
        return this.players.find((plr) => plr.id == playerId) || null
        
    }

    static gameover(): void {
        this.isGameover = true

        this.onGameoverListeners.forEach((cb) => cb())
    }

    static onShopChanged(callback: () => void) {
        this.onShopChangedListeners.push(callback)
    }

    static onGameover(callback: () => void) {
        this.onGameoverListeners.push(callback)
    }

    static onCombatChanged(callback: () => void) {
        this.onCombatChangedListeners.push(callback)
    }

    static startCombat(enemies: Enemy[]): Promise<CombatFinishedParameters> {
        if (this.currentBattle != null) {
            throw new Error("Can't start combat with existing combat still going")
        }

        this.currentBattle = new Battle(enemies.map((char) => reactive(char)) as Enemy[]);
        this.currentBattle.startCombat()

        this.onCombatChangedListeners.forEach((cb) => cb())

        return new Promise((resolve, reject) => {
            this.currentBattle!.onCombatFinished((params: CombatFinishedParameters) => {
                this.exitCombat()

                resolve(params)
            })
            
        })
    }

    static enterShop() {
        this.inShop = true
        this.onShopChangedListeners.forEach((cb) => cb())
    }

    static stopCombat() {
        if (this.currentBattle == null) {
            throw new Error("Can't stop combat without existing combat still going")
        }

        this.currentBattle.stopCombat({
            playersWon: false
        })

        this.exitCombat()

       
    }

    static exitCombat() {
        this.currentBattle = null

        this.onCombatChangedListeners.forEach((cb) => cb())
    }
}