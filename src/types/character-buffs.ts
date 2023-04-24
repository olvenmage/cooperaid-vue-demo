import { reactive } from "vue";
import { BuffPriority } from "./buff";
import type Buff from "./buff";
import type Character from "./character";
import type CharacterStats from "./character-stats";
import { isStackingBuff } from "./stacking-buff";
import { isStatMutatingBuff } from "./stat-mutating-buff";
import type { BuffState } from "./state/character-state";

export default class CharacterBuffs {
    private character: Character
    private collection : Record<BuffPriority, Buff[]> = {
        [BuffPriority.EARLY_1] : [],
        [BuffPriority.EARLY_2] : [],
        [BuffPriority.EARLY_3] : [],
        [BuffPriority.NORMAL_1] : [],
        [BuffPriority.NORMAL_2] : [],
        [BuffPriority.NORMAL_3] : [],
        [BuffPriority.LATE_1] : [],
        [BuffPriority.LATE_2] : [],
        [BuffPriority.LATE_3] : [],
        [BuffPriority.LAST_1] : [],
        [BuffPriority.LAST_2] : [],
        [BuffPriority.LAST_3] : [],
    }
    
    onBuffsChangedCallbacks: (() => void)[] = []

    constructor(character: Character) {
        this.character = character
    }

    get buffs(): Buff[] {
        return Object.values(this.collection).flat()
    }

    getState(): BuffState[] {
        return this.buffs.map((buff) => buff.getState())
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
            const index = this.collection[buff.priority].findIndex((collectionBuff) => collectionBuff.id == buff.id)

            if (index != -1) {
                this.collection[buff.priority].splice(index, 1)
                this.onBuffsChangedCallbacks.forEach((cb) => cb())
            }
        })

        this.collection[buff.priority].push(reactive(buff) as Buff)      

        buff.startBuff(this.character, givenBy)
        this.onBuffsChangedCallbacks.forEach((cb) => cb())  
    }

    forEach(callback: (buff: Buff) => void) {
        this.buffs.forEach(callback)
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

    removeAllBuffs() {
        this.forEach((buff) => {
            console.log(`removing buff ${buff.constructor.name}`)
            buff.endEffect(buff.attachedCharacter!)
        })
    }

    hasBuff(buffClass: any): boolean {
        return this.getExistingBuffByType(buffClass) != null
    }

    getExistingBuffForInstance(buffInstance: Buff): Buff|null {
        return this.buffs.find((collectionBuff) => collectionBuff.constructor == buffInstance.constructor) || null
    }

    private getExistingBuffByType(buffClass: typeof Buff) {
        return this.buffs.find((collectionBuff) => collectionBuff instanceof buffClass) || null
    }

    mutateStats(baseStats: CharacterStats): CharacterStats {
        let stats = baseStats

        for (const buff of this.buffs) {
            if (isStatMutatingBuff(buff)) {
                stats = buff.mutateStats(stats)
            }
        }

        return stats
    }
}