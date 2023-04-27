import GameSettings from "@/core/settings";

interface ExpGainedResult {
    levelsGained: number,
    expGained: number
}

export default class CharacterExp {
    currentlevel: number = 1
    currentExp: number = 0

    private getExpNeededForLevel(level: number): number {
        return ( level / GameSettings.exp.expAmountFactor ) ^ GameSettings.exp.expIncreaseFactor
    }

    gainExp(amount: number): ExpGainedResult {
        const oldLevel = this.currentlevel

        this.currentExp += amount;

        while (this.currentExp > this.getExpNeededForLevel(this.currentlevel)) {
            this.currentlevel++;
            this.currentExp -= this.getExpNeededForLevel(this.currentlevel)
        }

        return {
            levelsGained: this.currentlevel - oldLevel,
            expGained: amount
        }
    }
}