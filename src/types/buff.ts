import GameSettings from '@/core/settings';
import type Character from './character';

export enum BuffPriority {
    EARLY_1 = 0,
    EARLY_2 = 1,
    EARLY_3 = 2,
    NORMAL_1 = 3,
    NORMAL_2 = 4,
    NORMAL_3 = 5,
    LATE_1 = 6,
    LATE_2 = 7,
    LATE_3 = 8,
    LAST_1 = 9,
    LAST_2 = 10,
    LAST_3 = 11
}

export default abstract class Buff {
    // duration in microseconds
    protected abstract duration: number
    public durationCounter: number = 0
    public id: string = "buff" + Math.random().toString(16).slice(2)

    protected expiredTriggers: (() => void)[] = []

    public attachedCharacter: Character|null = null
    public givenBy: Character|null = null
    public unique = false
    public priority: BuffPriority = BuffPriority.NORMAL_1

    private ended = false

    startBuff(attachedCharacter: Character, givenBy: Character|null) {
        this.attachedCharacter = attachedCharacter
        this.givenBy = givenBy
        this.startEffect(attachedCharacter)
        this.incrementDuration(attachedCharacter)
    }

    startEffect(character: Character) {
       
    }

    increaseDuration(amount: number) {
        this.duration += amount
    }

    protected incrementDuration(character: Character) {
        if (this.durationCounter >= this.duration / GameSettings.speedFactor) {
            this.durationCounter = 0
            if (this.attachedCharacter) {
                this.endEffect(this.attachedCharacter)
            }
            return
        }

        setTimeout(() => {
            this.durationCounter += 100
            this.incrementDuration(character)
        }, 100)
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