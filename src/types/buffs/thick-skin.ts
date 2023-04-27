import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import { CHARACTER_TRIGGERS } from '../character-triggers';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class ThickSkinBuff extends Buff implements StatMutatingBuff {
    duration: number = 10 * 1000
    callback = this.giveFerocityToBear.bind(this)

    public imagePath: string | null = "/skills/druid/bear/thick-skin.png"

    override startEffect(character: Character): void {
        if (character.classBar) {
            character.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)

        super.endEffect(character)
    }

    giveFerocityToBear(trigger: OnDamageTrigger) {
        if (this.givenBy?.classBar != null) {
            this.givenBy.classBar.increase(2)
        }
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.armor.set(stats.derived.armor.value + 3)
        return stats
    }
}