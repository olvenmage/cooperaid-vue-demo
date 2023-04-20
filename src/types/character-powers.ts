import type CharacterStats from "./character-stats";
import type Power from "./power";

export default class CharacterPowers {
    private collection: Power[] = []

    onPowersChangedCallbacks: (() => void)[] = []

    get powers() {
        return this.collection
    }

    addPower(power: Power) {
        const existingPower = this.getExistingPowerForInstance(power)

        if (existingPower) {
            existingPower.addStack(1)

            this.onPowersChangedCallbacks.forEach((cb) => cb())  
            return
        }


        this.collection.push(power)
        this.onPowersChangedCallbacks.forEach((cb) => cb())  
    }
    
    onPowersChanged(callback: () => void) {
        this.onPowersChangedCallbacks.push(callback)
    }

    getExistingPowerForInstance(powerInstance: Power): Power|null {
        return this.collection.find((collectionPower) => collectionPower.constructor == powerInstance.constructor) || null
    }

    mutateStats(baseStats: CharacterStats): CharacterStats {
        let stats = baseStats

        for (const power of this.collection) {
            stats = power.mutateStats(stats)
        }

        return stats
    }
}