import GameSettings from '@/core/settings';
import type Character from '../character';
import DamageType from '../damage-type';
import FocusBar from '../special-bar/focus-bar';
import type StackingBuff from '../stacking-buff';
import TickBuff from '../tick-buff';

interface RegrowthBuffParams {
    duration: number
    totalHealAmount: number
}

export default class RegrowthBuff extends TickBuff {
    public tickInterval: number = 1500
    public duration = 12 * 1000
    
    public imagePath: string | null = "/skills/druid/regrowth.png"
    params: RegrowthBuffParams

    constructor(params: RegrowthBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    tickEffect(character: Character) {
        if (!this.givenBy) {
            return
        }

        if (this.givenBy?.classBar instanceof FocusBar) {
            this.givenBy.classBar.increase(2)
        }

        const tickAmount = Math.round(this.params.totalHealAmount / (this.duration / this.tickInterval))

        if (character.isEnemyTo(this.givenBy)) {
            this.givenBy.dealDamageTo({ target: character, type: DamageType.MAGICAL, amount: tickAmount})
        } else {
            character.restoreHealth(tickAmount, this.givenBy, 0.5)
        }
    }
}