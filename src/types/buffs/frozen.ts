import randomRange from '@/utils/randomRange';
import Buff from '../buff';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class FrozenBuff extends Buff implements StatMutatingBuff {
    duration: number = 4 * 1000

    mutateStats(stats: CharacterStats): CharacterStats {
        console.log("STUNNERONI 2")
        stats.stunned = true
    
        return stats
    }
}