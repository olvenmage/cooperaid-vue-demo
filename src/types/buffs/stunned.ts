import randomRange from '@/utils/randomRange';
import Buff from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import FocusBar from '../special-bar/focus-bar';
import TickBuff from '../tick-buff';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';

interface StunnedParams {
    duration: number,
}

export default class StunnedBuff extends Buff implements StatMutatingBuff {
    duration: number = 7 * 1000
    public isDebuff: boolean = true
    public isCC: boolean = true;

    public imagePath: string | null = "/buffs/stunned.png"
    params: StunnedParams

    constructor(params: StunnedParams) {
        super()
        this.duration = params.duration
        this.params = params
    }


    mutateStats(stats: CharacterStats): CharacterStats {
        stats.stunned = true

        return stats
    }
}