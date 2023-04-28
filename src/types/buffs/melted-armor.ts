import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class MeltedArmorBuff extends Buff implements StatMutatingBuff {
    duration: number = 8 * 1000

    public imagePath: string | null = "/buffs/reduced-armor.png"

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.armor.set(stats.derived.armor.value - 3)
        return stats
    }
}