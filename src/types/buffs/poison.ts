import type Character from '../character';
import DamageType from '../damage-type';
import FocusBar from '../special-bar/focus-bar';
import type StackingBuff from '../stacking-buff';
import TickBuff from '../tick-buff';

export default class PoisonBuff extends TickBuff implements StackingBuff {
    public baseTickInterval: number = 2000
    public duration = 100

    stackAmount = 1

    constructor(private damagePerStack: number, newDuration: number, private maxStack: number) {
        super()
        this.duration = newDuration
    }

    tickEffect(character: Character) {
        if (!this.givenBy) {
            return
        }

        if (this.givenBy?.classBar instanceof FocusBar) {
            this.givenBy.classBar.increase(this.stackAmount * 2)
        }

        character.takeDamage({ amount: this.stackAmount * this.damagePerStack, damagedBy: this.givenBy, type: DamageType.POISON })
    }

    addStack(amount: number) {
        if (this.givenBy?.classBar instanceof FocusBar) {
            this.givenBy.classBar.increase(1)
        }


        if (this.stackAmount == this.maxStack) {
            return
        }

        this.stackAmount += amount
    }
}