import GameSettings from '@/core/settings';
import type Character from './character';
import type { BuffState } from './state/character-state';

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
    public abstract imagePath: string|null
    public durationCounter: number = 0
    public id: string = "buff" + Math.random().toString(16).slice(2)

    protected expiredTriggers: (() => void)[] = []
    public showDuration = true

    public attachedCharacter: Character|null = null
    public givenBy: Character|null = null
    public unique = false
    public isDebuff = false
    public isCC = true
    public priority: BuffPriority = BuffPriority.NORMAL_1

    protected ended = false

    get durationLeft() {
        return ( this.duration / GameSettings.speedFactor) - this.durationCounter
    }

    startBuff(attachedCharacter: Character, givenBy: Character|null) {
        if (this.isCC) {
            this.duration *= (100 - attachedCharacter.stats.derived.hardiness.value) / 100
        }

        this.attachedCharacter = attachedCharacter
        this.givenBy = givenBy
        this.ended = false
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
            this.durationCounter += 200
            this.incrementDuration(character)
        }, 200)
    }

    endEffect(character: Character) {
        if (this.ended) return
        this.expiredTriggers.forEach((trigger) => trigger())
        this.expiredTriggers = [];
        this.ended = true
    }

    dispellEffect(character: Character) {
        this.endEffect(character)
    }

    addExpiredTrigger(trigger: () => void) {
        this.expiredTriggers.push(trigger)
    }

    getState(): BuffState {
        return {
            durationLeft: this.durationLeft,
            name: "",
            imagePath: this.imagePath,
            positive: true,
            showDuration: this.showDuration
        }
    }
}