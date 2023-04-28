import type Character from './character'
import Buff from './buff'
import GameSettings from '@/core/settings'


export default abstract class TickBuff extends Buff {
    // interval in miliseconds
    public abstract tickInterval: number
    public durationCounter: number = 0
    private tickCounter = 0

    public attachedCharacter: Character|null = null

    abstract tickEffect(character: Character): void


    protected incrementDuration(character: Character) {
        if (this.ended) return

        if (this.durationCounter >= this.duration / GameSettings.speedFactor) {
            this.durationCounter = 0
            if (this.attachedCharacter) {
                this.endEffect(this.attachedCharacter)
            }
            return
        }

        setTimeout(() => {
            this.durationCounter += 100
            this.tickCounter += 100

            if (this.tickCounter >= this.tickInterval / GameSettings.speedFactor) {
                this.tickEffect(character)
                this.tickCounter -= this.tickInterval / GameSettings.speedFactor
            }

            this.incrementDuration(character)
        }, 100)
    }

    override startBuff(attachedCharacter: Character, givenBy: Character|null) {
        if (this.isCC) {
            this.duration *= (100 - attachedCharacter.stats.derived.hardiness.value) / 100
        }

        this.attachedCharacter = attachedCharacter
        this.givenBy = givenBy
        this.tickCounter = 0
        this.startEffect(attachedCharacter)
        this.incrementDuration(attachedCharacter)
    }

    dispellEffect(character: Character) {
        this.endEffect(character)
    }
}