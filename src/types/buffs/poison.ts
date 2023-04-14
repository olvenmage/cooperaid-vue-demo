import type Character from '../character';
import DamageType from '../damage-type';
import type StackingBuff from '../stacking-buff';
import TickBuff from '../tick-buff';

export default class PoisonBuff extends TickBuff implements StackingBuff {
    public baseTickInterval: number = 1000
    public duration = 100

    stackAmount = 1

    constructor(private damagePerStack: number, newDuration: number) {
        super()
        this.duration = newDuration
    }

    tickEffect(character: Character) {
        if (!this.givenBy) {
            return
        }

        character.takeDamage({ amount: this.stackAmount * this.damagePerStack, damagedBy: this.givenBy, type: DamageType.POISON })
    }

    addStack(amount: number) {
        this.stackAmount += amount
    }
}