import type Buff from "./buff";
import type Character from "./character";
import type CharacterStats from "./character-stats";
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
    
    onBuffsChanged(callback: () => void) {
        this.onBuffsChangedCallbacks.push(callback)
    }

    hasBuff(buffClass: typeof Buff): boolean {
        return this.collection.some((collectionBuff) => collectionBuff instanceof buffClass)
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