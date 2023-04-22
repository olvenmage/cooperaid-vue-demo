import type Character from '../character'
import type CharacterStats from '../character-stats'
import ClassBar from '../class-bar'

export default class RageBar extends ClassBar {
    tickConsumeAmount = 25
    tickInterval = 750

    constructor() {
        super(100, "red")
    }

    tickEffect(character: Character, consumeEffectiveness: number) {
        character.restoreHealth(
            Math.floor((0.05 / consumeEffectiveness) * character.healthBar.max),
            character,
            0.35
        )
    }

    override mutateStats(stats: CharacterStats): CharacterStats {
        stats.energyBoost.set(stats.energyBoost.value + 100)

        return stats
    }

}