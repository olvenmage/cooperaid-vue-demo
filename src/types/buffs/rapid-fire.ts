import GameSettings from '@/core/settings';
import type Character from '../character';
import TickBuff from '../tick-buff';
import type StatMutatingBuff from '../stat-mutating-buff';
import type CharacterStats from '../character-stats';

export default class RapidFireBuff extends TickBuff implements StatMutatingBuff {
    // interval in miliseconds (1000 = every second)
    public tickInterval: number = 1000

    duration: number = 14 * 1000
    public unique: boolean = true

    buildAmount = 1
   

    tickEffect(character: Character) {
        this.buildAmount++
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.speed.set(stats.speed.value + (5 * this.buildAmount))
        stats.energyBoost.set(stats.energyBoost.value + (5 * this.buildAmount))

        return stats
    }
}