import GameSettings from '@/core/settings';
import type Character from './character';


export default abstract class Buff {
    // duration in microseconds
    protected abstract duration: number
    public durationCounter: number = 0
    public id: string = "buff" + Math.random().toString(16).slice(2)

    protected expiredTriggers: (() => void)[] = []

    protected attachedCharacter: Character|null = null
    protected givenBy: Character|null = null

    private ended = false

    startBuff(attachedCharacter: Character, givenBy: Character|null) {
        this.attachedCharacter = attachedCharacter
        this.givenBy = givenBy
        this.startEffect(attachedCharacter)
        setTimeout(() => {
            this.endEffect(attachedCharacter)
        }, this.duration / GameSettings.speedFactor)
    }

    startEffect(character: Character) {
       
    }

    endEffect(character: Character) {
        if (this.ended) return
        this.expiredTriggers.forEach((trigger) => trigger())
        this.ended = true
    }

    dispellEffect(character: Character) {
        this.endEffect(character)
    }

    addExpiredTrigger(trigger: () => void) {
        this.expiredTriggers.push(trigger)
    }
}