import type Character from '../character'
import type CharacterStats from '../character-stats'
import ClassBar from '../class-bar'
import { isEmpowerableSkil } from '../skill-types/empowerable-skill'

export default class FocusBar extends ClassBar {
    constructor() {
        super(100, "#AB6DAC")
    }

    public tickInterval: number = 1000
    tickConsumeAmount = 18

    tickEffect(character: Character) {
    }

    override mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.castSpeed.set(stats.derived.castSpeed.value + 100)
        stats.derived.energyRegenHaste.set(stats.derived.energyRegenHaste.value + 50)

        return stats
    }
}   