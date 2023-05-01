import Game from '@/core/game';
import Buff, { BuffPriority } from '../buff';
import type Character from '../character';
import type CharacterStats from '../character-stats';
import { CHARACTER_TRIGGERS, type CharacterTriggerPayload } from '../character-triggers';
import type StatMutatingBuff from '../stat-mutating-buff';
import type OnDamageTrigger from '../triggers/on-damage-trigger';

interface HammerOfJusticeParams {
    duration: number,
    msPerDamageDealt: number,
    exposes: boolean,
    countsAllies: boolean,
    healsOnExpire: boolean
}

export class HammerOfJusticeStunBuff extends Buff implements StatMutatingBuff  {
    duration: number = 1 * 1000
    public imagePath: string | null = "/skills/paladin/hammer-of-justice.png"
    public isCC = true
    public isDebuff = true

    constructor(duration: number) {
        super()
        this.duration = duration
        console.log(`STUN EM ${this.duration}`)
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        stats.stunned = true

        return stats
    }
}

export default class HammerOfJusticeBuff extends Buff implements StatMutatingBuff {
    duration: number = 8 * 1000

    callback = this.buildStunDurationOnDamage.bind(this)
    public imagePath: string | null = "/skills/paladin/hammer-of-justice.png"
    damageDealt = 0
    params: HammerOfJusticeParams

    constructor(params: HammerOfJusticeParams) {
        super()
        this.duration = params.duration
        this.params = params
    }

    override startEffect(character: Character): void {
        this.damageDealt = 0
        character.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)

        super.startEffect(character)
    }

    override endEffect(character: Character): void {
        character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.callback)

        character.addBuff(new HammerOfJusticeStunBuff(this.damageDealt * this.params.msPerDamageDealt), this.givenBy)

        if (this.params.healsOnExpire) {
            const givenBy = this.givenBy
            const battle = Game.currentBattle

            if (givenBy && battle) {
                const alliesSortedByLowHealth = battle.combatants.filter((c) => !c.isEnemyTo(givenBy) && !c.dead).sort((c1, c2) => Math.sign(c1.healthBar.current - c2.healthBar.current))
                
                if (alliesSortedByLowHealth[0]) {
                    alliesSortedByLowHealth[0].restoreHealth(Math.round(this.damageDealt * 0.4), givenBy, 0.8)
                    this.givenBy?.classBar?.increase(5)
                }
            }
        }

        super.endEffect(character)
    }

    buildStunDurationOnDamage(trigger: CharacterTriggerPayload<OnDamageTrigger>) {
        const fromFriendly = this.givenBy && (this.params.countsAllies && !trigger.damagedBy?.isEnemyTo(this.givenBy))
        if (trigger.actualDamage > 0 && (fromFriendly || trigger.damagedBy?.id == this.givenBy?.id)) {
            this.damageDealt += trigger.actualDamage
            this.givenBy?.classBar?.increase(2)
        }
    }

    mutateStats(stats: CharacterStats): CharacterStats {
        if (this.params.exposes) {
            stats.derived.armor.set(stats.derived.armor.value - 2)
            stats.derived.magicalArmor.set(stats.derived.magicalArmor.value - 2)
        }

        return stats
    }
}