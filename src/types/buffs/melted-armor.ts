import Buff from '../buff';
import type Character from '../character';

export default class MeltedArmorBuff extends Buff {
    duration: number = 5 * 1000

    override startEffect(character: Character): void {
        if (character.classBar) {
            character.currentArmor -= 3
        }

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        character.currentArmor += 3

        super.endEffect(character)
    }
}