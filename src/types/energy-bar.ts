import GameSettings from "@/core/settings";
import type Character from "./character";
import type CharacterStats from "./character-stats";

export default class EnergyBar {
    public current: number
    public max: number

    regenning = false

    // Amount of miliseconds until an energy point is generated
    energyPointThreshold = 1000 
    energyCounter = 0

    // energRegenAmount / 100 = energy per second
    energyRegenAmount = GameSettings.defaultEnergyRegenAmount

    character: Character|null = null

    constructor(private stats: CharacterStats) {
        this.max = 10;
        this.current = 0;
    }

    increase(amount: number) {
        this.current = Math.min(this.current + amount, this.max)
    }

    
    decrease(amount: number) {
        this.current = Math.max(this.current - amount, 0)
    }

    start(character: Character) {
        this.current = GameSettings.startingEnergy
        this.character = character
        this.energyCounter = 0

        if (!this.regenning) {
            this.regen()
            this.regenning = true
        }
    }

    private regen() {
        if (GameSettings.generateEnergyWhileCasting || this.character?.castingSkill == null) {
            this.energyCounter += this.energyRegenAmount * (1 + (this.stats.energyBoost.value / 100 ))

            if (this.energyCounter >= this.energyPointThreshold) {
                this.energyCounter -= this.energyPointThreshold
                this.increase(1)
            }
        }
      
        setTimeout(() => {
            this.regen()
        }, 100 / GameSettings.speedFactor)
    }
}