import type Character from "@/types/character"
import type Enemy from "@/types/enemy"
import Faction from "@/types/faction"
import type Player from "@/types/player"
import { TargetType } from "@/types/skill"
import shuffleArray from "@/utils/shuffleArray"
import { globalThreatEvent } from "./events"
import Game from "./game"
import GameSettings from "./settings"

const settings = {
    enemyInteractSpeed: 0.5
}

export interface CombatFinishedParameters {
    playersWon: boolean
}

export default class Battle {
    public enemies: Enemy[]

    private runAiInterval = 0
    private checkAliveInterval = 0

    private combatants: Character[] = [];
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
        }, (settings.enemyInteractSpeed / GameSettings.speedFactor) * 1000)

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
        console.log("check alive")

        const anyPlayersAlive = Game.players.some((player) => !player.dead)
        
        if (!anyPlayersAlive) {
            console.log("no players alive")
            this.stopCombat({
                playersWon: false
            })
        }

        const anyEnemiesAlive = this.enemies.some((enemy) => !enemy.dead)

        if (!anyEnemiesAlive) {
            console.log("no enemies alive")
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
                if (Math.round(Math.random()) && character.energyBar.current < 8) {
                    return
                }
                const skill = character.ai.getSkillToCast(character);
    
                if (skill != null) {
                    let targettingMethod = skill.targetType

                    if (targettingMethod == TargetType.TARGET_ANY) {
                        const friendlyNeedsHelp = this.combatants.some((c) => !character.isEnemyTo(c) && skill.getCastPriority(character, c) > 10)
                        // coinflip
                        if (friendlyNeedsHelp && Math.round(Math.random())) {
                            targettingMethod = TargetType.TARGET_FRIENDLY
                        } else {
                            targettingMethod = TargetType.TARGET_ENEMY
                        }
                    }

                    let target: Character|null = null

                    if (targettingMethod == TargetType.TARGET_ENEMY) {
                        target = character.ai.getHighestThreatTarget();
    
                        if (target == null) {
                            shuffleArray(this.combatants)
                            this.combatants.forEach((char2) => {
                                if (character.isEnemyTo(char2)) {
                                    target = char2;
                                }
                            })
                        }
                    } else if (targettingMethod == TargetType.TARGET_FRIENDLY) {
                        shuffleArray(this.combatants)
                        const friendlies = this.combatants.filter((char2) => !character.isEnemyTo(char2))
                        target = friendlies[0]

                        friendlies.forEach((c) =>{
                            if (target == null || skill.getCastPriority(character, c) > skill.getCastPriority(character, target)) {
                                target = c
                            }
                        })      
                    } else if (targettingMethod == TargetType.TARGET_ALL_ENEMIES) {
                        skill.cast(character, this.combatants.filter((char) => character.isEnemyTo(char)))
                    }
    
                    if (target == null || target.dead) {
                      return;
                    }
    
                    skill.cast(character, [target])
                }
            }
        })
    }
}