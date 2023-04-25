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

    totalTicks: number
    tickCount: number = 0
    leftoverHealing: number

    constructor(params: RegrowthBuffParams) {
        super()
        this.duration = params.duration
        this.params = params

        this.totalTicks = Math.floor(this.duration / this.tickInterval)
        this.leftoverHealing = params.totalHealAmount
    }

    startEffect(character: Character): void {
        this.tickCount = 0
        this.leftoverHealing = this.params.totalHealAmount
        super.startEffect(character)
    }

    tickEffect(character: Character) {
        if (!this.givenBy) {
            return
        }

        if (this.givenBy?.classBar instanceof FocusBar) {
            this.givenBy.classBar.increase(2)
        }

        const healAmount = Math.round(this.leftoverHealing / (this.totalTicks - this.tickCount))

        this.leftoverHealing -= healAmount

        if (character.isEnemyTo(this.givenBy)) {
            this.givenBy.dealDamageTo({ targets: [character], type: DamageType.MAGICAL, amount: healAmount, noCrit: true })
        } else {
            character.restoreHealth(healAmount, this.givenBy, 0.5)
        }

        this.tickCount++;
    }
}