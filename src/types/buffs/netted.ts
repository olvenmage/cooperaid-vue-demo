import Buff, { BuffPriority } from '../buff';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class NettedBuff extends Buff implements StatMutatingBuff {
    duration: number = 8 * 1000
    priority = BuffPriority.LAST_3

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.flying = false;
        stats.speed.set(stats.speed.value - 50)
        // todo cant do melee attacks

        return stats
    }
}