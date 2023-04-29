import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type DamageType from '../damage-type';

interface DivineJudgementBuffParams {
    duration: number,
    damage: number
    damageType: DamageType
}

export default class DivineJudgementBuff extends Buff {
    duration: number = 8 * 1000

    public imagePath: string | null = "/skills/paladin/divine-judgement.png"
    public isDebuff = true

    params: DivineJudgementBuffParams

    constructor(params: DivineJudgementBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    override startEffect(character: Character): void {
        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        if (!character.dead && this.givenBy) {
            this.givenBy.dealDamageTo({ targets: [character], amount: this.params.damage, type: this.params.damageType })
            this.givenBy.classBar?.increase(12)
        }

        super.endEffect(character)
    }
}