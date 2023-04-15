import presenterSocket from "@/client-socket/presenter-socket"
import type Character from "@/types/character"
import Player from "@/types/player"
import type Enemy from "@/types/enemy"
import type BattleState from "@/types/state/battle-state"
import CharacterAIBrain from "./ai"
import { globalThreatEvent } from "./events"
import Game from "./game"
import GameSettings from "./settings"
import { pubUpdateBattleState } from "../client-socket/OutgoingMessages"
import { subCastSkill } from "../client-socket/IncomingMessages"

const settings = {
    enemyInteractSpeed: 1
}

export interface CombatFinishedParameters {
    playersWon: boolean
}

export default class Battle {
    public enemies: Enemy[]

    private runAiInterval = 0
    private checkAliveInterval = 0
    private syncClientsInterval = 0

    public combatants: Character[] = [];
    private onCombatFinishedListeners: ((params: CombatFinishedParameters) => void)[] = []

    constructor(enemies: Enemy[]) {
        this.enemies = enemies
        this.combatants = [
            ...this.enemies,
            ...Game.players
        ]
    }

    public onCombatFinished(listener: (params: CombatFinishedParameters) => void) {
        this.onCombatFinishedListeners.push(listener)
    }

    public startCombat() {        
        this.runAiInterval = setInterval(() => {
            this.runAI()
        }, (GameSettings.aiInteractDelay / GameSettings.speedFactor) * 1000)

        this.checkAliveInterval = setInterval(() => {
            this.checkAlive()
        }, 1000)

        this.syncClientsInterval  =setInterval(() => {
            this.syncClients()
        }, 200)

        const unsubscribe = Game.eventBus.subscribe(globalThreatEvent, event => {
            this.combatants
            .filter((char) => event.payload.healer.isEnemyTo(char))
            .forEach((enemy) => {
                enemy.raiseThreat(event.payload.healer, event.payload.amount)
            })
        })

        presenterSocket.subscribe(subCastSkill, (event) => {
            const player = Game.players.find((plr) => plr.id == event.body.playerId)

            if (!player) {
                return
            }

            const skill = player.skills.find((sk) => sk.name == event.body.skill)

            if (!skill?.canCast(player)) {
                return
            }

            const targets = this.combatants.filter((combatant) => event.body.targets.includes(combatant.id))

            skill.cast(player, () => targets)
        })

        this.onCombatFinished(() => {
            unsubscribe();
        })

        this.initializeCombatants()
    }

    public stopCombat(combatFinishedParams: CombatFinishedParameters) {
        clearInterval(this.checkAliveInterval)
        clearInterval(this.runAiInterval)
        clearInterval(this.syncClientsInterval)

        this.onCombatFinishedListeners.forEach((cb) => cb(combatFinishedParams))
        this.onCombatFinishedListeners = [];
    }

    private initializeCombatants() {
        this.combatants.forEach((combatant) => combatant.initializeCombat())
    }

    private checkAlive() {
        const anyPlayersAlive = Game.players.some((player) => !player.dead)
        
        if (!anyPlayersAlive) {
            setTimeout(() => {
                this.stopCombat({
                    playersWon: false
                })
            }, 2000)
           
        }

        const anyEnemiesAlive = this.enemies.some((enemy) => !enemy.dead)

        if (!anyEnemiesAlive) {
            this.stopCombat({
                playersWon: true
            })
        }
    }

    private runAI() {
        this.combatants.forEach((character) => {
            if (character.dead) {
              return;
            }
    
            if (character.ai != null) {
                CharacterAIBrain.act(character, this)
            }
        })
    }

    private syncClients() {
        const allies = this.combatants.filter((c) => c instanceof Player)
        const allyStates = allies.map((p) => p.getState())

        const enemies = this.combatants.filter((c) => !allies.includes(c)).map((e) => e.getState())

        Game.players.filter((player) => player.connectedExternally).forEach((player) => {
            presenterSocket.publish(
                pubUpdateBattleState({
                    playerId: player.id,
                    state: {
                        enemies,
                        allies: allyStates.filter((a) => a.id != player.id),
                        self: allyStates.find((a) => a.id == player.id) || player.getState()
                    }
                })
            )
        })
    }
}