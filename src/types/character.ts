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
import Player from './player';
import type Skill from './skill';
import type OnDamageTrigger from './triggers/on-damage-trigger';
import type CharacterStats from './character-stats';


export default abstract class Character {
    public id: string;
    public identity: Identity
    public factions: Faction[]
    public dead = false
    public castingSkill: Skill|null = null
    public healthBar: Healthbar
    public energyBar: EnergyBar
    public classBar: ClassBar|null = null
    public ai: CharacterAI|null = null
    public currentMagicalArmor: number = 0

    public buffs = new CharacterBuffs(this)

    public stats: CharacterStats

    constructor(identity: Identity, factions: Faction[]) {
        this.id = "char" + Math.random().toString(16).slice(2)
        this.identity = identity;
        this.healthBar = new Healthbar(identity.baseStats.maxHealth.value)
        this.energyBar = new EnergyBar(identity.maxEnergy)
        this.factions = factions;
        this.stats = identity.baseStats.clone()

        this.buffs.onBuffsChanged(() => this.recalculateStats())
        this.recalculateStats()

        if (!(this instanceof Player)) {
            this.ai = new CharacterAI(identity)
        }
    }

    recalculateStats() {
        this.stats.recalculateBasedOn(this.identity.baseStats)
        this.buffs.mutateStats(
            this.stats
        )

        this.healthBar.max = this.stats.maxHealth.value
    }


    get skills() {
        return this.identity.skills
    }

    dealDamage(amount: number, target: Character, damageType: DamageType, threatModifier: number = 1) {
        if (this.dead) {
            return
        }

        target.takeDamage(amount, this, damageType, threatModifier)
    }

    takeDamage(
        amount: number,
        damagedBy: Character|null,
        damageType: DamageType, 
        threatModifier: number = 1
    ) {
        if (this.dead) {
            return
        }

        let actualDamage: number

        if (damageType == DamageType.PHYSICAL) {
            actualDamage = Math.max(amount - this.stats.armor.value, 0)
        } else if (damageType == DamageType.MAGICAL) {
            actualDamage = Math.max(amount - this.stats.magicalArmor.value, 0)
        } else {
            actualDamage = amount
        }
        
        if (damagedBy?.id != this.id) {
            this.raiseThreat(damagedBy, actualDamage * threatModifier)
        }

        const damageTrigger: OnDamageTrigger = {
            id: "dmg" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
            character: this,
            actualDamage,
            originalDamage: amount,
            damagedBy,
            damageType,
            threatModifier
        }

        for (const beforeDamageTrigger of this.identity.beforeDamageTakenTriggers) {
            damageTrigger.actualDamage = beforeDamageTrigger(damageTrigger);
        }

        this.healthBar.decrease(damageTrigger.actualDamage)
        
        this.checkDeath();       
        this.identity.onDamageTakenTriggers.forEach((cb) => cb(damageTrigger))
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

    addBuff(buff: Buff, givenBy: Character|null = null) {
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
        if (character.factions.some((faction) => this.factions.includes(faction))) {
            return false
        }
     
        return true
    }

    initializeCombat(): void {
        this.identity.onCreated(this)
        this.energyBar.start(this)
    }
}