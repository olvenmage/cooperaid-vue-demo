import type Character from './character';


export default abstract class Buff {
    // duration in microseconds
    public abstract duration: number
    public durationCounter: number = 0

    protected attachedCharacter: Character|null = null

    startBuff(character: Character) {
        this.attachedCharacter = character
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