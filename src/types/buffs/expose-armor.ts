import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class ExposeArmorBuff extends Buff implements StatMutatingBuff {
    duration: number = 8 * 1000

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.armor.set(stats.armor.value - 4)
        return stats
    }
}