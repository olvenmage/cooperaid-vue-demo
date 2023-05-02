import presenterSocket from "@/client-socket/presenter-socket"
import type Character from "@/types/character"
import type Enemy from "@/types/enemy"
import CharacterAIBrain from "./ai"
import { globalThreatEvent } from "./events"
import Game from "./game"
import GameSettings from "./settings"
import { pubUpdateBattleState } from "../client-socket/OutgoingMessages"
import { subCastSkill } from "../client-socket/IncomingMessages"
import { reactive } from "vue"

const settings = {
    enemyInteractSpeed: 1
}

export interface CombatFinishedParameters {
    playersWon: boolean
}

export interface GoldStage {
    index: number,
    counter: number,
    goldAmount: number,
    totalTime: number,
    value: number
    complete: boolean
}

export default class Battle {
    public enemies: Character[]

    private runAiInterval = 0
    private checkAliveInterval = 0
    private syncClientsInterval = 0
    private incrementGoldStageCounterInterval = 0

    public combatants: Character[] = [];
    private onCombatFinishedListeners: ((params: CombatFinishedParameters) => void)[] = []

    goldStage = reactive({
        index: 0,
        counter: 0,
        goldAmount: 0,
        totalTime: 0,
        value: 0,
        complete: false
    }) as GoldStage

    constructor(enemies: Enemy[], private gold: number) {
        this.enemies = enemies.map((player) => player.createCharacter())

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


        this.setGoldStateFromSettings(GameSettings.goldRewardStages[0])
        this.incrementGoldStageCounterInterval = setInterval(() => {
            this.incrementGoldStageCounter()
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
        clearInterval(this.incrementGoldStageCounterInterval)

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

        const anyEnemiesAlive = this.combatants.some((enemy) => !enemy.isFriendly && !enemy.dead)

        if (!anyEnemiesAlive) {
            const gold = Math.round((this.goldStage.value / 100) * this.gold)

            console.log(`gained ${gold} gold`)

            Game.players.value.forEach((player) => player.resources.gold += gold)

            this.stopCombat({
                playersWon: true
            })

            Game.players
        }
    }

    private incrementGoldStageCounter() {
        if (this.goldStage.complete) {
            return;
        }

        this.goldStage.counter += 200

        if (this.goldStage.counter >= this.goldStage.totalTime) {
            const nextStage = GameSettings.goldRewardStages[this.goldStage.index + 1]

            if (nextStage) {
                this.goldStage.counter = 0;
                this.setGoldStateFromSettings(nextStage)
                this.goldStage.index += 1;
                return;
            } else {
                this.goldStage.complete = true;
            }
        } 
    }

    private setGoldStateFromSettings(settingsGoldState: { value: number, time: number}) {
        this.goldStage.totalTime = (settingsGoldState.time * 1000) / GameSettings.speedFactor
        this.goldStage.goldAmount = Math.round((settingsGoldState.value / 100) * this.gold)
        this.goldStage.value = settingsGoldState.value
        this.goldStage.complete = false
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