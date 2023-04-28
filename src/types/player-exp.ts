import GameSettings from "@/core/settings";
import type ExpGainedState from "./state/exp-gained-state";

export default class PlayerExp {
    currentLevel: number = 1
    currentExp: number = 0
    lastExpGainedResult: ExpGainedState|null = null

    private getExpNeededForLevel(level: number): number {
        return ( level / GameSettings.exp.expAmountFactor ) ^ GameSettings.exp.expIncreaseFactor
    }

    gainExp(amount: number): ExpGainedState {
        const oldLevel = this.currentLevel
        const oldExp = this.currentExp

        this.currentExp += amount;

        while (this.currentExp > this.getExpNeededForLevel(this.currentLevel)) {
            const lvlupExp = this.getExpNeededForLevel(this.currentLevel)
            this.currentLevel++;
            this.currentExp -= lvlupExp
        }

        const expResult = {
            oldLevel: {
                level: oldLevel,
                currentExp: oldExp,
                maxExp: this.getExpNeededForLevel(oldLevel)
            },
            newLevel: {
                level: this.currentLevel,
                currentExp: this.currentExp,
                maxExp: this.getExpNeededForLevel(this.currentLevel)
            },
            levelsGained: this.currentLevel - oldLevel,
            expGained: amount,
            statPointsGained: (this.currentLevel - oldLevel) * GameSettings.statPointsPerLevel
        }

        this.lastExpGainedResult = expResult

        return expResult
    }

    getExpTable(amount: number = 10): Record<number, number> {
        const table: Record<number, number> = {}

        for (let i = 1; i < amount + 1; i++) {
            table[i] = this.getExpNeededForLevel(i)
        }

        return table;
    }
}