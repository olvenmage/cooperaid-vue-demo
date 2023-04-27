import type Character from '../character'
import Skill, { TargetType, type CastSkillResponse, SkillRange } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData from '../skill-data';
import NettedBuff from '../buffs/netted';
import RageBar from '../special-bar/rage-bar';
import BloodthirstyRampage from '../skill-upgrades/barbarian/bloodthirsty-rampage';
import AngryYellingSkillGem from '../skill-upgrades/barbarian/angry-yelling';
import BloodLustBuff from '../buffs/blood-lust';
import { CHARACTER_TRIGGERS } from '../character-triggers';
import { BlessedWeapon } from './paladin';


export default class Barbarian extends PlayerIdentity {
    public name = "Barbarian"
    public baseStats = new CoreStats({
        constitution: 12,
        strength: 16,
        dexterity: 10,
        intelligence: 6
    })
    public imagePath = "/classes/barbarian.png"
    public playerClass = PlayerClass.BARBARIAN
    public basicSkills: Skill[] = [new RecklessStrike(), new Shout()]
    public color = "#E7623E";
    public description: string = "The Barbarian, different as they might be, are defined by their rage: unbridled, unquenchable, and unthinking fury. With unmatched combat prowess, they are willing to go to any length to ensure victory."

    public skills = [
        new Rampage(),
    ]

    private rageGeneratedCallback = this.generateRageOnDamage.bind(this)

    possibleSkills: Skill[] = [
        new RagingBlow(),
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
        
        if (damagedBy?.id == character.id) {
            ragePercentagePenalty = 0.15
        } else if (damagedBy && !character.isEnemyTo(damagedBy)){
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
    skillData: SkillData = new SkillData({
        name: "Reckless Strike",
        energyCost: 2,
        cooldown: 0,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 1000,
        imagePath: "/barbarian/reckless-strike.png",
        damage: 10,
        range: SkillRange.MELEE
    })

    selfDamageAmount = 4

    description: string | null = "Basic. Take 4 damage to deal 10 damage to an enemy."

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage ?? 0, type: DamageType.PHYSICAL, threatModifier: 0.8, targets })
    }

    beforeCast(castBy: Character): void {
        castBy.takeDamage({ amount: this.selfDamageAmount, damagedBy: castBy, type: DamageType.BLEED });
    }

    override canCast(castBy: Character): boolean {
        if (castBy.healthBar.current <= this.selfDamageAmount) {
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

export class RagingBlow extends Skill {
    skillData: SkillData = new SkillData({
        name: "Raging Blow",
        energyCost: 4,
        cooldown: 1 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 2000,
        imagePath: "/barbarian/raging-blow.png",
        range: SkillRange.MELEE,
    })

    description: string | null = "Deal 12 damage to an enemy, gain rage equal to the actual damage done."

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        const results = castBy.dealDamageTo({ amount: 12, targets, type: DamageType.PHYSICAL })

        if (castBy.classBar != null) {
            for (const result of results) {
                castBy.classBar.increase(result.actualDamage)
            }
        }
    }
}

export class Rampage extends Skill {
    skillData: SkillData = new SkillData({
        name: "Rampage",
        energyCost: 5,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 1250,
        imagePath: "/barbarian/rampage.png",
        damage: 10,
        range: SkillRange.MELEE,
    })

    description: string | null = "Deal 10 to an enemy, deals more damage the lower your health (max: 20)"

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        const missingHealthPercentage = (castBy.healthBar.current / castBy.healthBar.max);
        const damageToDeal = Math.ceil((this.skillData.damage ?? 10) * (2 - missingHealthPercentage))
        const threatModifier = 2.5 * missingHealthPercentage

        const damageResults = castBy.dealDamageTo({ amount: damageToDeal, targets, type: this.skillData.damageType!, threatModifier })

        if (this.socketedUpgrade instanceof BloodthirstyRampage) {
            for (const damageDealt of damageResults) {
                castBy.restoreHealth(Math.floor(damageDealt.actualDamage * 0.3), castBy, 0.4)
            }
        }
    }
}

export class Shout extends Skill {
    skillData: SkillData = new SkillData({
        name: "Shout",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        damageType: DamageType.PHYSICAL,
        castTime: 1000,
        imagePath: "/barbarian/shout.png",
        range: SkillRange.RANGED,
        damage: 8
    })

    description: string | null = "Deal 8 piercing damage divided amongst all enemies, generates a lot of threat"

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        const damage = Math.ceil(this.skillData.damage / targets.length)

        castBy.dealDamageTo({ amount: damage, targets, type: this.skillData.damageType!, threatModifier: 2, minAmount: damage })

        if (this.socketedUpgrade instanceof AngryYellingSkillGem && castBy.classBar) {
            castBy.classBar.increase(targets.length)
        }
    }
}

export class Whirlwind extends Skill {
    skillData: SkillData = new SkillData({
        name: "Whirlwind",
        energyCost: 8,
        cooldown: 9 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        damageType: DamageType.PHYSICAL,
        castTime: 1500,
        imagePath: "/barbarian/whirlwind.png",
        range: SkillRange.MELEE,
        damage: 12
    })

    description: string | null = "Deal 12 damage to all enemies"

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        castBy.dealDamageTo({ amount: this.skillData.damage, targets, type: this.skillData.damageType!, threatModifier: 0.9 })
    }
}

export class HeavyNet extends Skill {
    skillData: SkillData = new SkillData({
        name: "Heavy Net",
        energyCost: 4,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        range: SkillRange.RANGED,
        imagePath: "barbarian/heavy-net.png",
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
    skillData: SkillData = new SkillData({
        name: "Axe Throw",
        energyCost: 1,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        castTime: 1000,
        imagePath: "/barbarian/axe-throw.png",
        range: SkillRange.RANGED,
    })

    COOLDOWN = 12 * 1000

    description: string | null = "Deal 8 damage to an enemy, can be retrieved to reset cooldown"

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        if (this.skillData.isTransformed) {
            this.finishCooldown()

            return {
                triggerCooldown: false
            }
        } else {
            castBy.dealDamageTo({ amount: 8, targets, type: DamageType.PHYSICAL, threatModifier: 1 })
        }
    }

    onCooldownSkillData(): Partial<SkillData> | null {
        return {
            name: "Retrieve Axe",
            energyCost: 1,
            castTime: 1500,
            imagePath: "/barbarian/retrieve-axe.png",
            targetType: TargetType.TARGET_NONE,
            range: SkillRange.MELEE,
        }
    }
}


export class BloodLust extends Skill {
    skillData: SkillData = new SkillData({
        name: "Blood Lust",
        energyCost: 2,
        cooldown: 10 * 1000,
        targetType: TargetType.TARGET_SELF,
        castTime: 500,
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

        castBy.dealDamageTo({ amount: healthConsumed, targets: [castBy], type: DamageType.BLEED })

        castBy.addBuff(new BloodLustBuff({
            duration: this.skillData.buffDuration,
            healthConsumed: Math.round((castBy.healthBar.max - castBy.healthBar.current) * 0.3)
        }), castBy)

    }
}

export class BloodStrike extends Skill {
    skillData: SkillData = new SkillData({
        name: "Blood Strike",
        energyCost: 3,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        castTime: 1100,
        damage: 7,
        imagePath: "/barbarian/blood-strike.png",
        range: SkillRange.MELEE,
    })

    description: string | null = "Deal 7 damage to an enemy and restore the actual damage done in health to you."

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        const results = castBy.dealDamageTo({ amount: this.skillData.damage, targets: targets, type: DamageType.PHYSICAL })

        for (const result of results) {
            castBy.restoreHealth(result.actualDamage, castBy, 0.3)
        } 
    }   
}