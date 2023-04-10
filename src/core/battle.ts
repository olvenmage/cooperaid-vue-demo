import type Enemy from "@/types/enemy"
import Faction from "@/types/faction"
import type Player from "@/types/player"
import shuffleArray from "@/utils/shuffleArray"

const settings = {
    energySpeed: 1,
    enemyInteractSpeed: 1.5
}

export default class Battle {
    public enemies: Enemy[]
    public players: Player[]

    private energyInterval = 0
    private runAiInterval = 0

    constructor(players: Player[], enemies: Enemy[]) {
        this.enemies = enemies
        this.players = players
    }

    public startCombat() {
        this.energyInterval = setInterval(() => {
            this.energyTick()
        }, settings.energySpeed * 1000)
      
        
        this.runAiInterval = setInterval(() => {
            this.runAI()
        }, settings.enemyInteractSpeed * 1000)
    }

    public stopCombat() {
        clearInterval(this.energyInterval)
        clearInterval(this.runAiInterval)
    }

    private energyTick() {
        const battlefield = [
            ...this.enemies,
            ...this.players
        ]

        battlefield.forEach((ch) => ch.gainEnergy(1))
    }

    private runAI() {
        const battlefield = [
            ...this.enemies,
            ...this.players
        ]

        battlefield.forEach((character) => {
            if (character.dead) {
              return;
            }
    
            if (character.ai != null) {
                const skill = character.ai.getSkillToCast(character);
    
                if (skill != null) {
                    let target = character.ai.getHighestThreatTarget();
    
                    if (target == null) {
                        shuffleArray(battlefield)
                      battlefield.forEach((char2) => {
                        if (char2.factions[0] == Faction.ALLIES) {
                          target = char2;
                        }
                      })
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