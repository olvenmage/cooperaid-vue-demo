import type Character from './character'
import Buff from './buff'


export default abstract class TickBuff extends Buff {
    // interval in miliseconds
    public abstract tickInterval: number
    public durationCounter: number = 0

    protected attachedCharacter: Character|null = null

    abstract tickEffect(character: Character): void

    private incrementDuration(character: Character) {
        if (this.durationCounter >= this.duration) {
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

    startBuff(character: Character) {
        this.attachedCharacter = character
        this.incrementDuration(character)
        this.startEffect(character)
    }

    startEffect(character: Character) {
       
    }

    endEffect(character: Character) {

    }

    dispellEffect(character: Character) {
        this.endEffect(character)
    }
}