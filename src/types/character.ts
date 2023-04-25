import EnergyBar from './energy-bar';
import type Faction from './faction';
import type Identity from './identity';
import Healthbar from './health-bar';
import CharacterAI from './character-ai';
import type ClassBar from './class-bar'
import PlayerIdentity from './player-identity';
import type Buff from './buff';
import DamageType from './damage-type';
import CharacterBuffs from './character-buffs';
import SavingGrace from './buffs/saving-grace';
import Game from '@/core/game';
import { globalThreatEvent, characterDiedEvent } from '@/core/events';
import type Player from './player';
import type Skill from './skill';
import type OnDamageTrigger from './triggers/on-damage-trigger';
import type CharacterStats from './character-stats';
import CharacterSkills from './character-skills';
import type { DealDamageToParams, TakeDamageParams, TakeDamageResult } from './damage';
import { reactive } from 'vue';
import GameSettings from '@/core/settings';
import type CharacterState from './state/character-state';
import type Battle from '@/core/battle';
import CharacterPowers from './character-powers';


export default class Character {
    public id: string;
    public subId = "sub" + Math.random().toString(16).slice(2)
    public identity: Identity
    public dead = false
    public castingSkill: Skill|null = null
    public healthBar: Healthbar
    public energyBar: EnergyBar
    public classBar: ClassBar|null = null
    public ai: CharacterAI|null = null
    public currentMagicalArmor: number = 0

    public buffs = new CharacterBuffs(this)
    private characterSkills: CharacterSkills

    public baseStats: CharacterStats
    public stats: CharacterStats

    characterPowers: CharacterPowers

    public player: Player|null = null

    public isFriendly: boolean

    deleted: boolean = false

    constructor(identity: Identity, isFriendly = false, characterSkills: CharacterSkills|null = null) {
        this.id = "char" + Math.random().toString(16).slice(2)
        this.identity = identity;

        if (characterSkills == null) {
            characterSkills = new CharacterSkills(identity.skills, null)
        }
        this.characterSkills = characterSkills
        this.healthBar = new Healthbar(identity.baseStats.maxHealth.value)
        this.stats = reactive(identity.baseStats.clone()) as CharacterStats
        this.baseStats = reactive(identity.baseStats.clone()) as CharacterStats
        this.characterPowers = new CharacterPowers()
        this.energyBar = new EnergyBar(this.stats)
        this.isFriendly = isFriendly

        this.buffs.onBuffsChanged(() => this.recalculateStats())
        this.characterPowers.onPowersChanged(() => this.recalculateStats())
        this.recalculateStats()
    }

    recalculateStats() {
        if (this.deleted) {
            console.error("Dont recalc deleted character")
            return
        }

        this.stats.recalculateBasedOn(this.baseStats)
        this.characterPowers.mutateStats(this.stats)
        this.buffs.mutateStats(
            this.stats
        )

        if (this.classBar?.activated) {
            this.classBar?.mutateStats(this.stats)
        }

        this.healthBar.max = this.stats.maxHealth.value
    }

    enableAI() {
        this.ai = new CharacterAI(this.identity)
    }


    get skills() {
        return this.characterSkills.skills
    }

    get actionable() {
        return !this.stats.stunned && !this.dead
    }

    resetCooldowns() {
        this.characterSkills.resetCooldowns()
    }

    removeSkill(skillClass: typeof Skill): this {
        this.characterSkills.removeSkill(skillClass)
        return this
    }

    addSkill(skill: Skill): this {
        this.characterSkills.addSkill(skill)
        return this
    }

    dealDamageTo(damage: DealDamageToParams): OnDamageTrigger[] {
        if (this.dead) {
            return []
        }

        let isCrit = false

        console.log(`deal damage, crit : ${this.stats.crit.value}`)
        if (!damage.noCrit && (Math.random() * 100) <= this.stats.crit.value ) {
            isCrit = true
            damage.amount *= 2
        }

        const onDamages: (OnDamageTrigger|null)[] = [];

        for (const target of damage.targets) {
            onDamages.push(
                target.takeDamage({
                    ...damage,
                    isCrit,
                    damagedBy: this
                })
            )
        }

        return onDamages.filter((c) => c != null) as OnDamageTrigger[]
    }

    takeDamage(damage: TakeDamageParams): OnDamageTrigger|null {
        if (this.dead) {
            return null
        }

        let actualDamage: number

        if (damage.type == DamageType.PHYSICAL) {
            actualDamage = Math.max(damage.amount - this.stats.armor.value, damage.minAmount ?? 0)
        } else if (damage.type == DamageType.MAGICAL) {
            actualDamage = Math.max(damage.amount - this.stats.magicalArmor.value, damage.minAmount ?? 0)
        } else {
            actualDamage = damage.amount
        }

        if (damage.damagedBy?.id != this.id) {
            this.raiseThreat(damage.damagedBy, actualDamage * (damage.threatModifier || 1))
        }

        const damageTrigger: OnDamageTrigger = {
            id: "dmg" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
            character: this,
            actualDamage,
            originalDamage: damage.amount,
            damagedBy: damage.damagedBy,
            damageType: damage.type,
            threatModifier: damage.threatModifier ?? 1,
            isCrit: damage.isCrit ?? false
        }

        for (const beforeDamageTrigger of this.identity.beforeDamageTakenTriggers) {
            damageTrigger.actualDamage = beforeDamageTrigger(damageTrigger);
        }

        this.healthBar.decrease(damageTrigger.actualDamage)
        
        this.checkDeath();       
        this.identity.onDamageTakenTriggers.forEach((cb) => cb(damageTrigger))

        return damageTrigger
    }

    raiseThreat(threatBy: Character|null, threat: number) {
        if (this.ai != null && threatBy != null) {
            this.ai.raiseThreat(threatBy, threat)
        }
    }

    restoreHealth(amount: number, healer: Character|null, threatModifier: number = 1) {
        if (this.dead) {
            return
        }

        const amountHealed = this.healthBar.increase(amount)

        if (healer != null) {
            Game.eventBus.publish(globalThreatEvent({
                healer,
                amount: amountHealed * threatModifier,
            }))
        }
       
    }

    gainEnergy(amount: number) {
        if (this.dead) {
            return
        }

        this.energyBar.increase(amount)
    }

    addBuff(buff: Buff, givenBy: Character|null) {
        this.buffs.addBuff(buff, givenBy)
    }

    checkDeath() {
        if (this.healthBar.current <= 0) {
            this.dead = true;
            Game.eventBus.publish(characterDiedEvent({
                character: this
            }))
            
        }
    }

    isEnemyTo(character: Character): boolean {
        return character.isFriendly != this.isFriendly
    }

    initializeCombat(): void {
        this.characterSkills.applyUpgrades()
        this.identity.onCreated(this)

        this.classBar?.onActivedCallbacks.push(() => {
            this.recalculateStats()
        })

        this.energyBar.start(this)
    }

    getState(battle: Battle|null = null): CharacterState {
        this.characterSkills.applyUpgrades()
        const basicSkill = this.skills[0]

        return {
            id: this.id,
            skills: this.skills.filter((sk) => sk.id != basicSkill?.id).map((sk) => sk.getState(this, battle)),
            basicSkill: basicSkill?.getState(this, battle),
            imagePath: this.identity.imagePath,
            healthBar: {
                current: this.healthBar.current,
                max: this.healthBar.max,
            },
            energyBar: {
                current: this.energyBar.current,
                max: this.energyBar.max
            },
            specialBar: this.classBar ? {
                current: this.classBar.current,
                max: this.classBar.max,
                active: this.classBar.activated,
                color: this.classBar.color
            } : null,
            stats: this.stats.getState(),
            buffs: this.buffs.getState(),
            dead: this.dead,
            highestThreatId: this.ai?.getHighestThreatTarget()?.id ?? null
        }
    }

    deleteCharacter() {
        this.buffs.removeAllBuffs()
        this.deleted = true
    }
}