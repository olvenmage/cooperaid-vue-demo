import type CharacterStats from "../character-stats";
import Power from "../power";

export default class ArmorPower extends Power {
    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.armor.set(stats.derived.armor.value + this.stackAmount)

        return stats
    }
}