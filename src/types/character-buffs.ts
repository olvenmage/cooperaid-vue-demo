import type Buff from "./buff";
import type Character from "./character";
import type CharacterStats from "./character-stats";
import { isStackingBuff } from "./stacking-buff";
import { isStatMutatingBuff } from "./stat-mutating-buff";

export default class CharacterBuffs {
    private character: Character
    private collection: Buff[] = []
    
    onBuffsChangedCallbacks: (() => void)[] = []

    constructor(character: Character) {
        this.character = character
    }

    get buffs() {
        return this.collection
    }

    addBuff(buff: Buff, givenBy: Character|null = null) {
        if (isStackingBuff(buff) || buff.unique) {
            const existingBuff = this.getExistingBuffForInstance(buff)

            if (existingBuff) {
                existingBuff.durationCounter = 0

                if (isStackingBuff(existingBuff)) {
                    existingBuff.addStack(1)
                }

                this.onBuffsChangedCallbacks.forEach((cb) => cb())  
                return
            }

        }

        buff.addExpiredTrigger(() => {
            const index = this.collection.findIndex((collectionBuff) => collectionBuff.id == buff.id)

            if (index != -1) {
                this.collection.splice(index, 1)
                this.onBuffsChangedCallbacks.forEach((cb) => cb())
            }
        })

        this.collection.push(buff)      

        buff.startBuff(this.character, givenBy)
        this.onBuffsChangedCallbacks.forEach((cb) => cb())  
    }

    forEach(callback: (buff: Buff) => void) {
        this.collection.forEach(callback)
    }
    
    onBuffsChanged(callback: () => void) {
        this.onBuffsChangedCallbacks.push(callback)
    }

    removeBuffByType(buffClass: any) {
        const existingBuff = this.getExistingBuffByType(buffClass)

        if (existingBuff && existingBuff.attachedCharacter != null) {
            existingBuff.endEffect(existingBuff.attachedCharacter)
        }
    }

    removeBuff(buff: Buff) {
        const existingBuff = this.getExistingBuffForInstance(buff)

        if (existingBuff && existingBuff.attachedCharacter != null) {
            existingBuff.endEffect(existingBuff.attachedCharacter)
        }
    }

    hasBuff(buffClass: any): boolean {
        return this.getExistingBuffByType(buffClass) != null
    }

    getExistingBuffForInstance(buffInstance: Buff): Buff|null {
        return this.collection.find((collectionBuff) => collectionBuff.constructor == buffInstance.constructor) || null
    }

    private getExistingBuffByType(buffClass: typeof Buff) {
        return this.collection.find((collectionBuff) => collectionBuff instanceof buffClass) || null
    }

    mutateStats(baseStats: CharacterStats): CharacterStats {
        let stats = baseStats

        for (const buff of this.collection) {
            if (isStatMutatingBuff(buff)) {
                stats = buff.mutateStats(stats)
            }
        }

        return stats
    }
}