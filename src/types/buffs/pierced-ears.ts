import Buff from '../buff';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class PiercedEarsBuff extends Buff implements StatMutatingBuff {
    duration: number = 6 * 1000
    public isCC = true

    public imagePath: string | null = "/buffs/pierced-ears.png"

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.armor.set(stats.derived.armor.value - 1)
        stats.derived.castSpeed.set(stats.derived.castSpeed.value - 50)
        return stats
    }
}