import type Character from '../character'
import Skill, { TargetType, type CastSkillResponse, SkillRange } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData, { DynamicSkillDataValue } from '../skill-data';
import NettedBuff from '../buffs/netted';
import RageBar from '../special-bar/rage-bar';
import BloodthirstyRampage from '../skill-upgrades/barbarian/bloodthirsty-rampage';
import AngryYellingSkillGem from '../skill-upgrades/barbarian/angry-yelling';
import BloodLustBuff from '../buffs/blood-lust';
import { CHARACTER_TRIGGERS } from '../character-triggers';
import { BlessedWeapon } from './paladin';
import GameSettings from '@/core/settings';
import CooldownReductionSkillGem from '../skill-upgrades/generic/cooldown-reduction-skill-gem';
import DamageIncreaseSkillGem from '../skill-upgrades/generic/damage-increase-skill-gem';
import BloodBerserkSkillGem from '../skill-upgrades/barbarian/blood-berserk';
import BloodBerserkBuff from '../buffs/blood-berserk';
import RagingBlowSkillGem from '../skill-upgrades/barbarian/bloodthirsty-rampage copy';


export default class Barbarian extends PlayerIdentity {
    public name = "Barbarian"
    public baseStats = new CoreStats({
        baseCrit: GameSettings.basePlayerCritChance,
        isPlayer: true,
        constitution: 11,
        strength: 16,
        dexterity: 12,
        intelligence: 5
    })
    public imagePath = "/classes/barbarian.png"
    public playerClass = PlayerClass.BARBARIAN
    public basicSkills: Skill[] = [new RecklessStrike(), new Shout()]
    public color = "#E7623E";
    public description: string = "The Barbarian, different as they might be, are defined by their rage: unbridled, unquenchable, and unthinking fury. With unmatched combat prowess, they are willing to go to any length to ensure victory."

    public skills = [
        new Rampage()
    ]

    private rageGeneratedCallback = this.generateRageOnDamage.bind(this)

    possibleSkills: Skill[] = [
        new EnragingBlow(),
        new Rampage(),
        new AxeThrow(),
        new HeavyNet(),
        new Whirlwind(),
        new BloodLust(),
        new BloodStrike()
    ]

    override onCreated(character: Character) {
        character.classBar = new RageBar()

        if (character.classBar != null) {
            character.classBar.onFilled = () => {
                character.classBar?.activate(character)
            }
        }
     
        character.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.rageGeneratedCallback)
    }

    onDeleted(character: Character): void {
        character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, this.rageGeneratedCallback)

        super.onDeleted(character)
    }

    generateRageOnDamage({character, actualDamage, damagedBy}: OnDamageTrigger) {
        if (character.classBar == null || character.dead || actualDamage == 0) {
            return
        }

        let ragePercentagePenalty = 0.35
        
        if (damagedBy && !character.isEnemyTo(damagedBy)){
            // Increase rage penalty by double the amount if the damage is from an ally
            ragePercentagePenalty *= 2
        }

        const currentPercentage = character.healthBar.current / character.healthBar.max
        const rage = ((actualDamage / character.healthBar.max) * 100) * (2 - currentPercentage - ragePercentagePenalty)
        
        character.classBar.increase(
            Math.floor(rage)
        )
    }
}

export class RecklessStrike extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Reckless Strike",
        energyCost: 2,
        cooldown: 0,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 500,
        imagePath: "/barbarian/reckless-strike.png",
        damage: new DynamicSkillDataValue(4).modifiedBy('strength', 0.75),
        range: SkillRange.MELEE,
    })

    description: string | null = "Basic. Recklessly Strike an enemy for {damage} damage. Deals your attack damage in damage back to you."

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, type: this.skillData.damageType, threatModifier: 0.85, targets })
    }

    beforeCast(castBy: Character): void {
        castBy.takeDamage({ amount: Math.floor(castBy.stats.core.strength.value * 0.25), damagedBy: castBy, type: DamageType.BLEED });
    }

    override canCast(castBy: Character): boolean {
        if (castBy.healthBar.current <= castBy.stats.derived.attackDamage.value) {
            return false
        }

        return super.canCast(castBy)
    }

    override getCastPriority(castBy: Character, target: Character) {
        if (castBy.healthBar.current / castBy.healthBar.max < 0.4) {
            return -1
        }

        return 1
    }
}

export class EnragingBlow extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Enraging Blow",
        energyCost: 4,
        cooldown: 1 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 1500,
        imagePath: "/barbarian/raging-blow.png",
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(6).modifiedBy('strength', 0.7),
    })

    description: string | null = "Deal {damage} damage to an enemy, gain rage equal to the actual damage done."

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        let damage = this.skillData.damage.value

        if (this.socketedUpgrade instanceof RagingBlowSkillGem && castBy.classBar?.activated) {
            damage *= 1.5
        }

        const results = castBy.dealDamageTo({ amount: Math.round(damage), targets, type: this.skillData.damageType })

        if (castBy.classBar != null) {
            for (const result of results) {
                castBy.classBar.increase(result.actualDamage)
            }
        }
    }
}

export class Rampage extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Rampage",
        energyCost: 5,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 1000,
        imagePath: "/barbarian/rampage.png",
        damage: new DynamicSkillDataValue(4).modifiedBy('strength', 0.75),
        range: SkillRange.MELEE,
        strengthDamageModifier: 0.6
    })

    description: string | null = "Deal {damage} to an enemy, deals up to double damage based on how low health you are. Increases threat caused the higher health you are."

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        const missingHealthPercentage = (castBy.healthBar.current / castBy.healthBar.max);
        const damageToDeal = Math.ceil((this.skillData.damage.value) * (2 - missingHealthPercentage))
        const threatModifier = 2.5 * missingHealthPercentage

        const damageResults = castBy.dealDamageTo({ amount: damageToDeal, targets, type: this.skillData.damageType!, threatModifier })

        if (this.hasGem(BloodthirstyRampage)) {
            for (const damageDealt of damageResults) {
                castBy.restoreHealth(Math.floor(damageDealt.actualDamage * 0.3), castBy, 0.4)
            }
        }
    }
}

export class Shout extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Shout",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        damageType: DamageType.PHYSICAL,
        castTime: 500,
        imagePath: "/barbarian/shout.png",
        range: SkillRange.RANGED,
        damage: new DynamicSkillDataValue(3).modifiedBy('strength', 0.4).modifiedBy('constitution', 0.4),
    })

    description: string | null = "Deal {damage} piercing damage divided amongst all enemies, generates a lot of threat"

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        const damage = Math.ceil(this.skillData.damage.value / targets.length)

        castBy.dealDamageTo({ amount: damage, targets, type: this.skillData.damageType!, threatModifier: 2, minAmount: damage })

        if (this.hasGem(AngryYellingSkillGem) && castBy.classBar) {
            castBy.classBar.increase(targets.length * 2)
        }
    }
}

export class Whirlwind extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Whirlwind",
        energyCost: 8,
        cooldown: 9 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        damageType: DamageType.PHYSICAL,
        castTime: 1250,
        imagePath: "/barbarian/whirlwind.png",
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(6).modifiedBy('strength', 0.85),
    })

    description: string | null = "Deal {damage} damage to all enemies"

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: this.skillData.damageType!, threatModifier: 0.9 })
    }
}

export class HeavyNet extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Heavy Net",
        energyCost: 4,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        range: SkillRange.RANGED,
        imagePath: "/barbarian/heavy-net.png",
        castTime: 1500,
        buffDuration: 10 * 1000
    })

    description: string | null = "Throw a net on an enemy at range, slowing them tremendously and grounding them"

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        targets.forEach((target) => {
            target.addBuff(new NettedBuff(this.skillData.buffDuration), castBy)
            target.raiseThreat(castBy, 10)
        })
    }
}

export class AxeThrow extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Axe Throw",
        energyCost: 1,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 250,
        imagePath: "/barbarian/axe-throw.png",
        range: SkillRange.RANGED,
        damage: new DynamicSkillDataValue(4).modifiedBy('strength', 0.5).modifiedBy('dexterity', 0.5),
    })

    COOLDOWN = 12 * 1000

    description: string | null = "[BUGGED] Deal {damage} damage to an enemy, can be retrieved to reset cooldown"

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        if (this.skillData.isTransformed) {
            this.finishCooldown()

            return {
                triggerCooldown: false
            }
        } else {
            castBy.dealDamageTo({ amount: 8, targets, type: this.skillData.damageType, threatModifier: 1 })
        }
    }

    onCooldownSkillData(): Partial<SkillData> | null {
        return {
            name: "Retrieve Axe",
            energyCost: 1,
            castTime: 750,
            imagePath: "/barbarian/retrieve-axe.png",
            targetType: TargetType.TARGET_NONE,
            range: SkillRange.MELEE,
        }
    }
}


export class BloodLust extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Blood Lust",
        energyCost: 2,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_SELF,
        damageType: DamageType.PHYSICAL,
        castTime: 250,
        imagePath: "/barbarian/blood-lust.png",
        range: SkillRange.MELEE,
        buffDuration: 8 * 1000
    })

    description: string | null = "Take 25% of your current health in damage and enter Blood Lust. Your next attack's damaged is increased by 30% of your missing health"

    canCast(castBy: Character): boolean {
        if (castBy.healthBar.current <= 1) {
            return false
        }

        return super.canCast(castBy)
    }

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        const healthConsumed = Math.round(0.25 * castBy.healthBar.current)

        const bloodBerserk = this.socketedUpgrade instanceof BloodBerserkSkillGem

        castBy.dealDamageTo({ amount: healthConsumed, targets: [castBy], type: DamageType.BLEED, noCrit: !bloodBerserk })

        castBy.addBuff(new BloodLustBuff({
            duration: this.skillData.buffDuration,
            healthConsumed: Math.round((castBy.healthBar.max - castBy.healthBar.current) * 0.3),
            increaseCrit: bloodBerserk
        }), castBy)

    }
}

export class BloodStrike extends Skill {
    baseSkillData: SkillData = new SkillData({
        name: "Blood Strike",
        energyCost: 3,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 1000,
        damage: new DynamicSkillDataValue(3).modifiedBy('strength', 0.65),
        imagePath: "/barbarian/blood-strike.png",
        range: SkillRange.MELEE,
    })

    description: string | null = "Deal {damage} damage to an enemy and restore the actual damage done in health to you."

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        const results = castBy.dealDamageTo({ amount: this.skillData.damage.value, targets: targets, type: this.skillData.damageType })

        for (const result of results) {
            castBy.restoreHealth(result.actualDamage, castBy, 0.3)
        } 
    }   
}