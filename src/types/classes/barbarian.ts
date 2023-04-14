import type Character from '../character'
import Skill, { TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import Enrage from '../buffs/enrage';
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import CharacterStats from '../character-stats';


export default class Barbarian extends PlayerIdentity {
    public name = "Barbarian"
    public baseStats = CharacterStats.fromObject({ maxHealth: 40, armor: 2})
    public imagePath = "/src/assets/classes/barbarian.png"
    public playerClass = PlayerClass.BARBARIAN
    public classBar = new ClassBar(100, 'red',)
    public basicSkill: Skill = new RecklessStrike()

    public skills = [
        new RagingBlow(),
        new Rampage(),

    ]

    override onCreated(character: Character) {
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
    name: string = "Reckless Strike";
    energyCost: number = 2;
    cooldown: number = 0;
    targetType: TargetType = TargetType.TARGET_ENEMY
    castTime = 1000

    selfDamageAmount = 4

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 10, type: DamageType.PHYSICAL, threatModifier: 0.8, target }))
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
    name: string = "Raging Blow";
    energyCost: number = 4;
    cooldown: number = 1 * 1000;
    targetType: TargetType = TargetType.TARGET_ENEMY
    castTime = 2500

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 12, target, type: DamageType.PHYSICAL }))

        if (castBy.classBar != null) {
            castBy.classBar.increase(12)
        }
    }
}

export class Rampage extends Skill {
    name: string = "Rampage";
    energyCost: number = 5;
    cooldown: number = 8 * 1000;
    targetType: TargetType = TargetType.TARGET_ENEMY
    castTime = 1500

    castSkill(castBy: Character, targets: Character[]): void {
        const missingHealthPercentage = (castBy.healthBar.current / castBy.healthBar.max);
        const damageToDeal = Math.ceil(10 * (2 - missingHealthPercentage))
        const threatModifier = 2.5 * missingHealthPercentage

        targets.forEach((target) => castBy.dealDamageTo({ amount: damageToDeal, target, type: DamageType.PHYSICAL, threatModifier }))
    }
}

export class Shout extends Skill {
    name: string = "Shout";
    energyCost: number = 2;
    cooldown: number = 6 * 1000;
    targetType: TargetType = TargetType.TARGET_ALL_ENEMIES
    castTime = 1000

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 3, target, type: DamageType.PHYSICAL, threatModifier: 3.5, minAmount: 3 }))
    }
}
