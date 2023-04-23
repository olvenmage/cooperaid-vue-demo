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
        stats.speed.set(stats.speed.value - 100)
        stats.energyBoost.set(stats.energyBoost.value - 100)

        return stats
    }
}