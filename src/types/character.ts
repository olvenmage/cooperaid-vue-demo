import EnergyBar from './energy-bar';
import type Faction from './faction';
import type Identity from './identity';
import Healthbar from './health-bar';
import ThreatTable from './threat-table';
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
import CharacterStats from './character-stats';
import CharacterSkills from './character-skills';
import type { DealDamageToParams, TakeDamageParams } from './damage';
import { reactive } from 'vue';
import type CharacterState from './state/character-state';
import type Battle from '@/core/battle';
import CharacterPowers from './character-powers';
import CharacterTriggers, { CHARACTER_TRIGGERS } from './character-triggers';
import DamageSchool from './damage-school';


export default class Character {
    public id: string;
    public subId = "sub" + Math.random().toString(16).slice(2)
    public identity: Identity
    public dead = false
    public castingSkill: Skill|null = null
    public healthBar: Healthbar
    public energyBar: EnergyBar
    public classBar: ClassBar|null = null
    public threat: ThreatTable|null = null
    public currentMagicalArmor: number = 0

    public buffs = new CharacterBuffs(this)
    private characterSkills: CharacterSkills
    public triggers = new CharacterTriggers(this)

    public baseStats: CharacterStats
    public stats: CharacterStats

    characterPowers: CharacterPowers

    public player: Player|null = null

    public isFriendly: boolean

    deleted: boolean = false

    constructor(identity: Identity, isFriendly = false, characterSkills: CharacterSkills|null = null, stats: CharacterStats|null) {
        this.id = "char" + Math.random().toString(16).slice(2)
        this.identity = identity;

        if (characterSkills == null) {
            characterSkills = new CharacterSkills(this, identity.skills, null)
        }

        if (stats == null) {
            stats = new CharacterStats(this.identity.baseStats.clone())
        }

        this.characterSkills = characterSkills
        this.stats = reactive(stats.clone()) as CharacterStats
        this.baseStats = reactive(stats.clone()) as CharacterStats

        this.healthBar = new Healthbar(this.stats.derived.maxHealth.value)
        this.characterPowers = new CharacterPowers()
        this.energyBar = new EnergyBar(this.stats)
        this.isFriendly = isFriendly

        this.buffs.onBuffsChanged(() => this.recalculateStats())
        this.characterPowers.onPowersChanged(() => this.recalculateStats())
        this.recalculateStats()
    }
    
    static fromPlayer(player: Player): Character {
        const charStats = new CharacterStats(player.coreStats)
        const character = reactive(new Character(player.playerClass!, true, null, charStats)) as Character

        const charSkills = new CharacterSkills(character, player.skills, player.basicSkill)
        charSkills.resetCooldowns()

        character.characterSkills = charSkills

        character.healthBar = player.healthBar
        character.id = player.id

        character.player = player

        if (player.aiEnabled) {
            character.enableAI()
        }

        character.identity.onCreated(character)
        character.classBar?.decrease(100)
        character.checkDeath()

        return character

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

        this.healthBar.max = this.stats.derived.maxHealth.value
    }

    enableAI() {
        this.threat = new ThreatTable()
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

        this.triggers.publish(CHARACTER_TRIGGERS.BEFORE_DAMAGE_DEALT, damage)

        let isCrit = false

        if (!damage.noCrit && (Math.random() * 100) <= this.stats.derived.critChance.value ) {
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

        if (damage.type == DamageType.PHYSICAL && this.stats.derived.dodgeChance.value > (Math.random() * 100)) {
            damage.isDodged = true
            damage.amount = 0
            damage.minAmount = 0
        }

        if (damage.isDodged) {
            this.triggers.publish(CHARACTER_TRIGGERS.ON_DODGE, { attackedBy: damage.damagedBy })
        }

        let actualDamage: number

        if (damage.type == DamageType.PHYSICAL) {
            actualDamage = Math.max(damage.amount - this.stats.derived.armor.value, damage.minAmount ?? 0)
        } else if (damage.type == DamageType.MAGICAL) {
            actualDamage = Math.max(damage.amount - this.stats.derived.magicalArmor.value, damage.minAmount ?? 0)
        } else {
            actualDamage = damage.amount
        }

        actualDamage = Math.round(actualDamage)

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
            isDodged: damage.isDodged ?? false,
            isCrit: damage.isCrit ?? false,
            school: damage.school ?? DamageSchool.NONE
        }

        this.triggers.publish(CHARACTER_TRIGGERS.BEFORE_DAMAGE_TAKEN, damageTrigger)

        this.healthBar.decrease(damageTrigger.actualDamage)
        
        this.checkDeath();    
        this.triggers.publish(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, damageTrigger)   

        return damageTrigger
    }

    raiseThreat(threatBy: Character|null, threat: number) {
        if (this.threat != null && threatBy != null) {
            this.threat.raiseThreat(threatBy, threat)
        }
    }

    restoreHealth(amount: number, healer: Character|null, threatModifier: number = 1) {
        if (this.dead) {
            return
        }

        amount = Math.round(amount)

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

    applyUpgrades() {
        this.characterSkills.applyUpgrades()
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
            highestThreatId: this.threat?.getCurrentTarget()?.id ?? null
        }
    }

    deleteCharacter() {
        this.buffs.removeAllBuffs()
        this.deleted = true
    }
}