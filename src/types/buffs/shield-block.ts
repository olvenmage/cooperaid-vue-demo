import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import { CHARACTER_TRIGGERS } from '../character-triggers';
import DamageType from '../damage-type';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

interface ShieldBlockBuffParams {
    duration: number
    damage: number
    durability: number
}

export default class ShieldBlockBuff extends Buff implements StatMutatingBuff {
    duration: number = 5 * 1000
    priority = BuffPriority.LAST_1

    public imagePath: string | null = "/skills/juggernaut/shield-block.png"

    ARMOR_VALUE = 8

    callback = this.shieldBlock.bind(this)
    params: ShieldBlockBuffParams

    constructor(params: ShieldBlockBuffParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    override startEffect(character: Character): void {
        character.triggers.on(CHARACTER_TRIGGERS.BEFORE_DAMAGE_TAKEN, this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character) {
        character.triggers.off(CHARACTER_TRIGGERS.BEFORE_DAMAGE_TAKEN, this.callback)
        
        super.endEffect(character)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.derived.armor.set(stats.derived.armor.value + this.ARMOR_VALUE)
        stats.derived.magicalArmor.set(stats.derived.magicalArmor.value + stats.derived.armor.value)

        return stats
    }

    shieldBlock(trigger: OnDamageTrigger): number {
        if (this.params.durability > 0 && trigger.damagedBy && trigger.originalDamage > (trigger.character.stats.derived.armor.value - this.ARMOR_VALUE)) {
            trigger.character?.dealDamageTo({amount: this.params.damage, targets: [trigger.damagedBy], type: DamageType.PHYSICAL, threatModifier: 2})
            
            this.params.durability -= 1

            console.log("SHIELD BLOCK!")
            if (this.params.durability == 0) {
                this.endEffect(trigger.character)
            }
        }

        return trigger.actualDamage
    }
}