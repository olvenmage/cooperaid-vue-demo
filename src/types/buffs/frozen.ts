import randomRange from '@/utils/randomRange';
import Buff from '../buff';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class FrozenBuff extends Buff implements StatMutatingBuff {
    duration: number = 4 * 1000
    public isDebuff = true

    public imagePath: string | null = "/skills/mage/frost-tomb.png"

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.stunned = true
    
        return stats
    }
}