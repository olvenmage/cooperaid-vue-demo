import Buff from '../buff';
import type CharacterStats from '../character-stats';
import type StackingBuff from '../stacking-buff';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class AggressiveBuff extends Buff implements StatMutatingBuff, StackingBuff {
    duration: number = 999999 * 1000

    public imagePath: string | null = null

    stackCount = 1

    addStack(amount: number): void {
        this.stackCount += 1
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.energyBoost.set(stats.energyBoost.value + (25 * this.stackCount))
        stats.speed.set(stats.speed.value + (25 * this.stackCount))

        return stats
    }
}