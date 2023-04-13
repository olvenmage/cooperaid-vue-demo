import GameSettings from "@/core/settings";
import type Character from "./character";

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

    constructor(maxEnergy: number) {
        this.max = maxEnergy;
        this.current = 0;
    }

    increase(amount: number) {
        if (this.current < this.max) {
            this.current += amount;
        }
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
            this.energyCounter += this.energyRegenAmount

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