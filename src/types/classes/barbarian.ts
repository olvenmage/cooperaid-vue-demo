import type Character from '../character'
import Skill, { TargetType, type CastSkillResponse } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import Enrage from '../buffs/enrage';
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import CharacterStats from '../character-stats';
import SkillData from '../skill-data';
import type SkillDamageUpgrade from '../skill-upgrades/skill-damage-upgrade';


export default class Barbarian extends PlayerIdentity {
    public name = "Barbarian"
    public baseStats = CharacterStats.fromObject({ maxHealth: 40, armor: 2})
    public imagePath = "/classes/barbarian.png"
    public playerClass = PlayerClass.BARBARIAN
    public basicSkill: Skill = new RecklessStrike()
    public color = "#E7623E";
    public description: string = "The Barbarian, different as they might be, are defined by their rage: unbridled, unquenchable, and unthinking fury. With unmatched combat prowess, they are willing to go to any length to ensure victory."

    public skills = [
        new RagingBlow(),
        new Rampage(),
        new AxeThrow(),
        new Shout()

    ]

    override onCreated(character: Character) {
        this.onDamageTakenTriggers = []

        character.classBar = new ClassBar(100, 'red')
        if (character.classBar != null) {
            character.classBar.onFilled = () => {
                if (character.classBar == null || character.classBar.activated) return
                character.addBuff(new Enrage(), character)
            }
        }
     
        this.onDamageTakenTriggers.push(this.generateRageOnDamage)
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
        castTime: 1000,
        imagePath: "/barbarian/reckless-strike.png",
        damage: 10
    })

    selfDamageAmount = 4

    description: string | null = "Basic. Take 4 damage to deal 10 damage to an enemy."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: this.skillData.damage ?? 0, type: DamageType.PHYSICAL, threatModifier: 0.8, target }))
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
        castTime: 2000,
        imagePath: "/barbarian/raging-blow.png"
    })

    description: string | null = "Deal 12 damage to an enemy and generate 12 rage."

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 12, target, type: DamageType.PHYSICAL }))

        if (castBy.classBar != null) {
            castBy.classBar.increase(12)
        }
    }
}

export class Rampage extends Skill {
    skillData: SkillData = new SkillData({
        name: "Rampage",
        energyCost: 5,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        castTime: 1250,
        imagePath: "/barbarian/rampage.png",
        damage: 10
    })

    description: string | null = "Deal 10 to an enemy, deals more damage the lower your health (max: 20)"

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        const missingHealthPercentage = (castBy.healthBar.current / castBy.healthBar.max);
        const damageToDeal = Math.ceil((this.skillData.damage ?? 10) * (2 - missingHealthPercentage))
        const threatModifier = 2.5 * missingHealthPercentage

        targets.forEach((target) => castBy.dealDamageTo({ amount: damageToDeal, target, type: DamageType.PHYSICAL, threatModifier }))
    }
}

export class Shout extends Skill {
    skillData: SkillData = new SkillData({
        name: "Shout",
        energyCost: 2,
        cooldown: 6 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        castTime: 1000,
        imagePath: "/barbarian/shout.png"
    })

    description: string | null = "Deal 3 piercing damage to all enemies, generates a lot of threat"

    castSkill(castBy: Character, targets: Character[]): CastSkillResponse {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 3, target, type: DamageType.PHYSICAL, threatModifier: 3.5, minAmount: 3 }))
    }
}

export class AxeThrow extends Skill {
    skillData: SkillData = new SkillData({
        name: "Axe Throw",
        energyCost: 1,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        castTime: 1000,
        imagePath: "/barbarian/axe-throw.png"
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
            targets.forEach((target) => castBy.dealDamageTo({ amount: 8, target, type: DamageType.PHYSICAL, threatModifier: 1 }))
        }
    }

    onCooldownSkillData(): Partial<SkillData> | null {
        return {
            name: "Retrieve Axe",
            energyCost: 1,
            castTime: 1500,
            imagePath: "/barbarian/retrieve-axe.png",
            targetType: TargetType.TARGET_NONE
        }
    }
}