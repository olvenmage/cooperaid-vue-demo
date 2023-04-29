import Buff, { BuffPriority } from '../buff';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

interface InnervateBuffParams {
    duration: number
}

export default class InnervateBuff extends Buff implements StatMutatingBuff {
    duration: number = 4 * 1000

    public imagePath: string | null = "/skills/druid/innervate.png"

    params: InnervateBuffParams

    constructor(params: InnervateBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }


    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.energyRegenHaste.set(stats.derived.energyRegenHaste.value + 50)

        return stats
    }
}