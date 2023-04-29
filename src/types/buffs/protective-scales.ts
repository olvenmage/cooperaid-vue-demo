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
import FerocityBar from '../special-bar/ferocity-bar';
import type OnBuffReceivedTrigger from '../triggers/on-buff-received-trigger';

interface ProtectiveScalesBuffParams {
    duration: number,
    protects: boolean
}

export default class ProtectiveScalesBuff extends TickBuff implements StatMutatingBuff {
    public tickInterval: number = 2000;
    duration: number = 7 * 1000

    triggered = false

    callback = this.nullifyDebuff.bind(this)
    
    public imagePath: string | null = "/skills/druid/protective-scales.png"
    params: ProtectiveScalesBuffParams

    stackCount = 0

    constructor(params: ProtectiveScalesBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    tickEffect(character: Character): void {
       this.stackCount++;
    }

    override startEffect(character: Character): void {
        this.stackCount = 0 ;
        character.triggers.on(CHARACTER_TRIGGERS.ON_BUFF_RECEIVED, this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.ON_BUFF_RECEIVED, this.callback)

        super.endEffect(character)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        if (this.params.protects) {
            stats.derived.armor.set(stats.derived.armor.value + this.stackCount)
            stats.derived.magicalArmor.set(stats.derived.magicalArmor.value + this.stackCount)
        }

        return stats
    }

    nullifyDebuff(trigger: CharacterTriggerPayload<OnBuffReceivedTrigger>): void {
        console.log("check buff")
        if (!this.triggered && trigger.buff.attachedCharacter && trigger.buff.givenBy?.isEnemyTo(trigger.buff.attachedCharacter)) {
            this.triggered = true

            trigger.buff.dispellEffect(trigger.buff.attachedCharacter)

            this.endEffect(trigger.character)
        }
    }
}