import type Enemy from "@/types/enemy";
import Player from "@/types/player";
import Battle, { type CombatFinishedParameters } from "./battle";
import { EventBus } from "ts-bus";
import { reactive, ref } from "vue";
import type Encounter from "./encounter";
import type { AppSocket } from "@/app-socket/lib/core/types";
import presenterSocket from '../client-socket/presenter-socket'
import { pubUpdatePlayerState } from "@/client-socket/OutgoingMessages";
import { allRewardsChosen } from "./events";

interface StartGameParams {
    players: Player[],
    route: Encounter[]
}

export enum GameState {
    TITLESCREEN,
    IN_SHOP,
    GAME_OVER,
    VICTORY,
    IN_LOBBY,
    WAITING,
    CHOOSING_REWARD,
    IN_COMBAT
}

export default abstract class Game {
    static currentBattle: Battle|null = null
    static eventBus = new EventBus()
    static players = ref<Player[]>([])
    static webSocket: AppSocket = presenterSocket
    private static route: Encounter[]


    public static state: GameState = GameState.TITLESCREEN

    private static onStateChangedListeners: (() => void)[] = []
    private static currentRouteIndex = 0

    static get inCombat(): boolean {
        return this.currentBattle != null
    }

    static async startGame(params: StartGameParams): Promise<void> {
        this.players.value = params.players.map((char) => reactive(char)) as Player[]
        this.route = params.route
        this.currentRouteIndex = -1
        
        this.nextEncounter()
    }

    public static setState(newState: GameState) {
        this.state = newState;
        this.onStateChangedListeners.forEach((cb) => cb())
    }

    static async nextEncounter() {
        this.currentRouteIndex++;

        if (!this.route[this.currentRouteIndex]) {
            this.victory()
            return;
        }

        for (const player of Game.players.value) {
            player.state.resetState()
        }

        const result = await this.route[this.currentRouteIndex].startEncounter()

        if (result.gameover) {
            this.gameover()
            return
        }

        if (result.startNextEncounter) {
            this.nextEncounter()
        }
    }

    static joinPlayer(playerName: string, playerId: string) {
        this.players.value.push(new Player(playerId, playerName, true, null))
    }

    static addCPU() {
        this.players.value.push(
            new Player(
                "plr" + Math.random().toString(16).slice(2), 
                "CPU",
                false,
                null
            ).enableAI()
        )
    }

    static updatePlayerState(player: Player) {
        if (!player.combatCharacter) {
            return
        }

        presenterSocket.publish(pubUpdatePlayerState({
            playerId: player.id,
            state: player.combatCharacter.getState()
        }))
    }

    static getPlayer(playerId: string): Player|null {
        return this.players.value.find((plr) => plr.id == playerId) as Player || null
    }

    static onStateChanged(cb: () => void) {
        this.onStateChangedListeners.push(cb)
    }

    static gameover(): void {
        this.setState(GameState.GAME_OVER)
    }

    static victory(): void {
        this.setState(GameState.VICTORY)
    }

    static startCombat(enemies: Enemy[]): Promise<CombatFinishedParameters> {
        if (this.currentBattle != null) {
            throw new Error("Can't start combat with existing combat still going")
        }

        this.currentBattle = new Battle(enemies.map((char) => reactive(char)) as Enemy[]);
        this.currentBattle.startCombat()

        this.setState(GameState.IN_COMBAT)

        return new Promise((resolve, reject) => {
            this.currentBattle!.onCombatFinished((params: CombatFinishedParameters) => {
                console.log("combat finished")
                this.exitCombat()

                resolve(params)
            })
            
        })
    }

    static handoutRewards() {
        this.players.value.forEach(player => {
            player.state.choosingReward.startChoosingReward()
        });

        this.setState(GameState.CHOOSING_REWARD)
    }

    static handoutExp(exp: number) {
        this.players.value.forEach((player) => {
            player.gainExp(exp)
        })

        this.setState(GameState.CHOOSING_REWARD)
    }

    static enterShop() {
        this.setState(GameState.IN_SHOP)
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

    static exitCombat(exp: number = 0) {
        this.currentBattle = null

        Game.players.value.forEach(player => {
            player.combatCharacter?.resetCooldowns()
            player.removeCharacter()
        });

        this.setState(GameState.WAITING)
    }
}