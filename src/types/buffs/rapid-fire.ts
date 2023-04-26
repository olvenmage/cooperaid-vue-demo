import GameSettings from '@/core/settings';
import type Character from '../character';
import TickBuff from '../tick-buff';
import type StatMutatingBuff from '../stat-mutating-buff';
import type CharacterStats from '../character-stats';

export default class RapidFireBuff extends TickBuff implements StatMutatingBuff {
    // interval in miliseconds (1000 = every second)
    public tickInterval: number = 1000

    public imagePath: string | null = "/buffs/rapid-fire.png"

    duration: number = 14 * 1000
    public unique: boolean = true

    buildAmount = 1
   

    tickEffect(character: Character) {
        if (!character.stats.stunned) {
            this.buildAmount++
            character.recalculateStats()
        }
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.castSpeed.set(stats.derived.castSpeed.value + (5 * this.buildAmount))
        stats.derived.energyRegenHaste.set(stats.derived.energyRegenHaste.value + (5 * this.buildAmount))

        return stats
    }
}