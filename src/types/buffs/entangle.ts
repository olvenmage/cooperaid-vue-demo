import Buff, { BuffPriority } from '../buff';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

export default class EntangleBuff extends Buff implements StatMutatingBuff {
    duration: number = 3 * 1000
    priority = BuffPriority.LAST_2

    public imagePath: string | null = "/skills/druid/entangle.png"

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.castSpeed.set(stats.derived.castSpeed.value - 100)
        stats.derived.energyRegenHaste.set(stats.derived.energyRegenHaste.value - 100)

        return stats
    }
}