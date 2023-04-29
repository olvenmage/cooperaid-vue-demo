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
        stats.derived.energyRegenHaste.set(stats.derived.energyRegenHaste.value + (20 * this.stackCount))
        stats.derived.castSpeed.set(stats.derived.castSpeed.value + (20 * this.stackCount))

        return stats
    }
}