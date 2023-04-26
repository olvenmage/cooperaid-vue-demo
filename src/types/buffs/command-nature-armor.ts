import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import type StackingBuff from '../stacking-buff';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

interface NaturesProtectionBuffParams {
    duration: number
    restoresHealthOnExpire?: boolean
}

export default class CommandNatureArmorBuff extends Buff implements StatMutatingBuff, StackingBuff {
    duration: number = 5 * 1000
    callback = this.giveFerocityToDruid.bind(this)
    stackAmount = 1

    public imagePath: string | null = "/skills/druid/command-nature.png"

    maxStacks = 3
    params: NaturesProtectionBuffParams

    constructor(params: NaturesProtectionBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
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

        if (this.params.restoresHealthOnExpire) {
            character.restoreHealth(this.stackAmount * 3, this.givenBy, 0.7)
        }

        super.endEffect(character)
    }

    giveFerocityToDruid(trigger: OnDamageTrigger) {
        if (this.givenBy?.classBar != null) {
            this.givenBy.classBar.increase(3 * this.stackAmount)
        }
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        if (this.givenBy && this.attachedCharacter?.isEnemyTo(this.givenBy)) {
            stats.armor.set(stats.armor.value - this.stackAmount)
        } else {
            stats.armor.set(stats.armor.value + this.stackAmount)
        }
        return stats
    }
}