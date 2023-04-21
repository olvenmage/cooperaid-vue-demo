import Buff, { BuffPriority } from '../buff';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class EntangleBuff extends Buff implements StatMutatingBuff {
    duration: number = 3 * 1000
    priority = BuffPriority.LAST_2

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.speed.set(0)
        stats.energyBoost.set(0)

        return stats
    }
}