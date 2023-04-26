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
import { HolyShock } from "@/types/classes/paladin"

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
            ...Game.players.value.map((player) => player.createCharacter())
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

        const unsubSkill = presenterSocket.subscribe(subCastSkill, (event) => {
            const player = Game.getPlayer(event.body.playerId)

            if (!player || !player.combatCharacter) {
                return
            }

            const skill = player.allSkills.find((sk) => sk.id == event.body.skill)
            
            if (!skill?.canCast(player.combatCharacter)) {
                return
            }

            const targets = this.combatants.filter((combatant) => event.body.targets.includes(combatant.id))

            skill.cast(player.combatCharacter, () => targets)
        })

        this.onCombatFinished(() => {
            unsubscribe();
            unsubSkill.unsubscribe();
        })

        this.initializeCombatants()
    }

    public stopCombat(combatFinishedParams: CombatFinishedParameters) {
        clearInterval(this.checkAliveInterval)
        clearInterval(this.runAiInterval)
        clearInterval(this.syncClientsInterval)

        this.onCombatFinishedListeners.forEach((cb) => cb(combatFinishedParams))
        this.onCombatFinishedListeners = [];

        if (combatFinishedParams.playersWon) {
            Game.players.value.forEach((player) => {
                console.log(player.combatCharacter)
                player.combatCharacter?.buffs?.removeAllBuffs()
            })
        }
    }

    private initializeCombatants() {
        this.combatants.forEach((combatant) => combatant.initializeCombat())
    }

    private checkAlive() {
        const anyPlayersAlive = Game.players.value.some((player) => !player.combatCharacter?.dead)
        
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
    
            if (character.threat != null) {
                CharacterAIBrain.act(character, this)
            }
        })
    }

    private syncClients() {
        const allies: Character[] = this.combatants.filter((c) => c.isFriendly)
        const allyStates = allies.map((p) => p.getState(this))

        const enemies = this.combatants.filter((c) => !allies.includes(c)).map((e) => e.getState(this))

        Game.players.value.filter((player) => player.controledExternally).forEach((player) => {
            presenterSocket.publish(
                pubUpdateBattleState({
                    playerId: player.id,
                    state: {
                        enemies,
                        allies: allyStates.filter((a) => a.id != player.id),
                        self: allyStates.find((a) => a.id == player.id) || player.combatCharacter!.getState(this)
                    }
                })
            )
        })
    }
}