import type Character from './character'
import Buff from './buff'
import GameSettings from '@/core/settings'


export default abstract class TickBuff extends Buff {
    // interval in miliseconds
    public abstract baseTickInterval: number
    public durationCounter: number = 0

    public attachedCharacter: Character|null = null

    abstract tickEffect(character: Character): void

    protected tickInterval: number = 0

    private incrementDuration(character: Character) {
        if (this.durationCounter >= this.duration / GameSettings.speedFactor) {
            this.durationCounter = 0
            if (this.attachedCharacter) {
                this.endEffect(this.attachedCharacter)
            }
            return
        }

        setTimeout(() => {
            this.durationCounter += this.tickInterval
            this.tickEffect(character)
            this.incrementDuration(character)
        }, this.tickInterval)
    }

    override startBuff(attachedCharacter: Character, givenBy: Character|null) {
        this.tickInterval = this.baseTickInterval / GameSettings.speedFactor
        this.attachedCharacter = attachedCharacter
        this.givenBy = givenBy
        this.startEffect(attachedCharacter)
        this.incrementDuration(attachedCharacter)
    }

    dispellEffect(character: Character) {
        this.endEffect(character)
    }
}