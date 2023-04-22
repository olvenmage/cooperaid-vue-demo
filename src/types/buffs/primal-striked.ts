import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import type StackingBuff from '../stacking-buff';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class PrimalStrikedBuff extends Buff implements StatMutatingBuff, StackingBuff {
    duration: number = 5 * 1000
    stackAmount = 1

    public imagePath: string | null = "/skills/druid/primal-striked.png"

    maxStacks = 4

    constructor(newDuration: number = 5 * 1000) {
        super()
        this.duration = newDuration
    }

    addStack(amount: number): void {
        if (this.stackAmount == this.maxStacks) {
            return
        }

        this.stackAmount += amount
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.speed.set(stats.speed.value + (this.stackAmount * 10))
        return stats
    }
}