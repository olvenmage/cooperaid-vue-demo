import GameSettings from '@/core/settings';
import type Character from './character';
import type CharacterStats from './character-stats';

export default abstract class Power {
    public id: string = "power" + Math.random().toString(16).slice(2)

    public attachedCharacter: Character|null = null
    public givenBy: Character|null = null
    protected stackAmount: number = 1

    addStack(amount: number) {
        this.stackAmount += amount
    }

    abstract mutateStats(stats: CharacterStats) : CharacterStats
}