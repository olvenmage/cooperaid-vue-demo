import Buff, { BuffPriority } from '../buff';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class ShieldShatteredBuff extends Buff implements StatMutatingBuff {
    duration: number = 8 * 1000
    public priority: BuffPriority = BuffPriority.EARLY_1

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.armor.set(0)
        return stats
    }
}