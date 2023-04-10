import type Character from '../character';
import TickBuff from '../tick-buff';

export default class Enrage extends TickBuff {
    // interval in miliseconds (every second)
    public tickInterval: number = 1000
    duration: number = 5 * 1000

    tickEffect(character: Character) {
        character.gainEnergy(1)
        character.restoreHealth(
            0.05 * character.healthBar.max,
            character,
            0.5
        )

        if (character.classBar) {
            character.classBar.decrease(Math.floor(character.classBar.max / (this.duration / this.tickInterval )))
        }
    }

    startEffect(character: Character): void {
        if (character.classBar) {
            character.classBar.activated = true
        }
    }

    endEffect(character: Character): void {
        if (character.classBar) {
            //character.classBar.current = 0
            character.classBar.activated = false
        }
    }
}