import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class ThickSkinBuff extends Buff implements StatMutatingBuff {
    duration: number = 10 * 1000
    callback = this.giveFerocityToBear.bind(this)

    public imagePath: string | null = "/skills/druid/bear/thick-skin.png"

    override startEffect(character: Character): void {
        if (character.classBar) {
            character.identity.onDamageTakenTriggers.push(this.callback)
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        const index = character.identity.onDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.onDamageTakenTriggers.splice(index, 1)
        }

        super.endEffect(character)
    }

    giveFerocityToBear(trigger: OnDamageTrigger) {
        if (this.givenBy?.classBar != null) {
            this.givenBy.classBar.increase(2)
        }
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.armor.set(stats.armor.value + 3)
        return stats
    }
}