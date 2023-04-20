import Buff from '../buff';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class FlyingBuff extends Buff implements StatMutatingBuff {
    duration: number = 6 * 1000

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.flying = true;

        return stats
    }
}