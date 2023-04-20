import Buff from '../buff';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class PiercedEarsBuff extends Buff implements StatMutatingBuff {
    duration: number = 6 * 1000

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.armor.set(stats.armor.value - 1)
        stats.speed.set(stats.speed.value - 50)
        return stats
    }
}