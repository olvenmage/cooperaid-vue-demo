import type Buff from "./buff";
import type Character from "./character";

export default class CharacterBuffs {
    private character: Character
    private collection: Buff[] = []

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
            }
        })

        this.collection.push(buff)        

        buff.startBuff(this.character, givenBy)
    }

    hasBuff(buffClass: typeof Buff): boolean {
        return this.collection.some((collectionBuff) => collectionBuff instanceof buffClass)
    }
}