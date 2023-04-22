import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import type StackingBuff from '../stacking-buff';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

export default class NaturesProtectionBuff extends Buff implements StatMutatingBuff, StackingBuff {
    duration: number = 5 * 1000
    callback = this.giveFerocityToDruid.bind(this)
    stackAmount = 1

    public imagePath: string | null = "/skills/druid/command-nature.png"

    maxStacks = 3

    constructor(newDuration: number = 5 * 1000) {
        super()
        this.duration = newDuration
    }

    override startEffect(character: Character): void {
        if (character.classBar) {
            character.identity.onDamageTakenTriggers.push(this.callback)
        }

        super.startEffect(character)
    }

    addStack(amount: number): void {
        if (this.stackAmount == this.maxStacks) {
            return
        }

        this.stackAmount += amount
    }

    override endEffect(character: Character): void {
        const index = character.identity.onDamageTakenTriggers.findIndex((trigger) => trigger == this.callback)

        if (index != -1) {
            character.identity.onDamageTakenTriggers.splice(index, 1)
        }

        super.endEffect(character)
    }

    giveFerocityToDruid(trigger: OnDamageTrigger) {
        if (this.givenBy?.classBar != null) {
            this.givenBy.classBar.increase(3 * this.stackAmount)
        }
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.armor.set(stats.armor.value + this.stackAmount)
        return stats
    }
}