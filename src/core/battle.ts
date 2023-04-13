import type Character from "@/types/character"
import type Enemy from "@/types/enemy"
import Faction from "@/types/faction"
import type Player from "@/types/player"
import { TargetType } from "@/types/skill"
import shuffleArray from "@/utils/shuffleArray"
import CharacterAIBrain from "./ai"
import { globalThreatEvent } from "./events"
import Game from "./game"
import GameSettings from "./settings"

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

        const unsubscribe = Game.eventBus.subscribe(globalThreatEvent, event => {
            this.combatants
            .filter((char) => event.payload.healer.isEnemyTo(char))
            .forEach((enemy) => {
                enemy.raiseThreat(event.payload.healer, event.payload.amount)
            })
        })

        this.onCombatFinished(() => {
            unsubscribe();
        })

        this.initializeCombatants()
    }

    public stopCombat(combatFinishedParams: CombatFinishedParameters) {
        clearInterval(this.checkAliveInterval)
        clearInterval(this.runAiInterval)

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
}