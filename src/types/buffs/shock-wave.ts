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

interface ShockWaveBuffParams {
    duration: number,
}

export default class ShockWaveBuff extends Buff implements StatMutatingBuff {
    public tickInterval: number = 1000;
    duration: number = 1 * 1000

    public isCC: boolean = true
    triggered = false

    public imagePath: string | null = "/skills/juggernaut/shock-wave.png"
    params: ShockWaveBuffParams

    constructor(params: ShockWaveBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.stunned = true

        return stats
    }
}