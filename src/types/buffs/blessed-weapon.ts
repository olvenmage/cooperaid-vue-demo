import Buff, { BuffPriority } from '../buff';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';

interface BlessedWeaponBuffParams {
    duration: number,
    damageAmount: number
}

export default class BlessedWeaponBuff extends Buff implements StatMutatingBuff {
    duration: number = 5 * 1000

    public imagePath: string | null = "/skills/juggernaut/shatter.png"

    params: BlessedWeaponBuffParams

    constructor(params: BlessedWeaponBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.attackDamage.set(stats.derived.attackDamage.value + this.params.damageAmount)
        return stats
    }
}