import type Character from '../character';
import DamageType from '../damage-type';
import FocusBar from '../special-bar/focus-bar';
import type StackingBuff from '../stacking-buff';
import TickBuff from '../tick-buff';

export default class RegrowthBuff extends TickBuff {
    public baseTickInterval: number = 1500
    public duration = 1500 * 4

    constructor() {
        super()
    }

    tickEffect(character: Character) {
        if (!this.givenBy) {
            return
        }

        if (this.givenBy?.classBar instanceof FocusBar) {
            this.givenBy.classBar.increase(2)
        }

        character.restoreHealth(3, this.givenBy, 0.65)
    }
}