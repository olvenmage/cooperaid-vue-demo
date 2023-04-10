import EnergyBar from './energy-bar';
import type Faction from './faction';
import type Skill from './skill';
import type Identity from './identity';
import Healthbar from './health-bar';
import CharacterAI from './character-ai';
import type ClassBar from './class-bar'
import PlayerIdentity from './player-identity';
import type Buff from './buff';
import DamageType from './damage-type';

export default abstract class Character {
    public id: string;
    public identity: Identity
    public factions: Faction[]
    public dead = false
    public casting = false
    public healthBar: Healthbar
    public energyBar: EnergyBar
    public classBar: ClassBar|null = null
    public ai: CharacterAI|null = null
    public currentArmor
    public buffs: Buff[] = []

    constructor(identity: Identity, factions: Faction[]) {
        this.id = "id" + Math.random().toString(16).slice(2)
        this.identity = identity;
        this.healthBar = new Healthbar(identity.maxHealth)
        this.energyBar = new EnergyBar(identity.maxEnergy)
        this.factions = factions;
        this.currentArmor = identity.armor
        
        if (!(identity instanceof PlayerIdentity)) {
            this.ai = new CharacterAI(identity)
        }
    }

    takeDamage(
        amount: number,
        damagedBy: Character|null,
        damageType: DamageType, 
        threatModifier: number = 1
    ) {
        let actualDamage: number

        if (damageType == DamageType.PHYSICAL) {
            actualDamage = Math.max(amount - this.currentArmor, 0)
        } else {
            actualDamage = amount
        }
        
        if (this.ai != null && damagedBy != null) {
            this.ai.raiseThreat(damagedBy, actualDamage * threatModifier)
        }

        
        this.healthBar.decrease(actualDamage)
        this.checkDeath();       
        this.identity.onDamageTakenTriggers.forEach((cb) => cb(actualDamage, this, damagedBy))
    }

    restoreHealth(amount: number, healedBy: Character|null, threatModifier: number = 1) {
        if (this.dead) {
            return
        }

        this.healthBar.increase(amount)
    }

    gainEnergy(amount: number) {
        if (this.dead) {
            return
        }

        this.energyBar.increase(amount)
    }

    addBuff(buff: Buff) {
        this.buffs.push(buff)
        buff.startBuff(this)
        // tod oremove buff from array
    }

    checkDeath() {
        if (this.healthBar.current <= 0) {
            this.dead = true;
        }
    }
}