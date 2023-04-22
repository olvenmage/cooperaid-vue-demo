import type Character from '../character';
import DamageType from '../damage-type';
import FocusBar from '../special-bar/focus-bar';
import type StackingBuff from '../stacking-buff';
import TickBuff from '../tick-buff';

export default class RegrowthBuff extends TickBuff {
    public tickInterval: number = 1500
    public duration = 12 * 1000
    
    public imagePath: string | null = "/skills/druid/regrowth.png"

    constructor(newDuration: number) {
        super()
        this.duration = newDuration
    }

    tickEffect(character: Character) {
        if (!this.givenBy) {
            return
        }

        if (this.givenBy?.classBar instanceof FocusBar) {
            this.givenBy.classBar.increase(2)
        }

        character.restoreHealth(2, this.givenBy, 0.5)
    }
}