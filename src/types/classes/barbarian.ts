import Character from '../character'
import Skill, { TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import Enrage from '../buffs/enrage';
import DamageType from '../damage-type';


export default class Barbarian extends PlayerIdentity {
    public name = "Barbarian"
    public maxHealth = 35
    public imagePath = "/src/assets/classes/barbarian.png"
    public playerClass = PlayerClass.BARBARIAN
    public classBar = new ClassBar(100, 'red',)
    public armor = 2

    public skills = [
        new RecklessStrike(),
        new RagingBlow(),
        new Rampage(),

    ]

    override onCreated(character: Character) {
        this.onDamageTakenTriggers.push((damage: number, character: Character, damagedBy: Character|null) => {
            if (character.classBar == null || character.classBar.activated || character.dead) {
                return
            }

            const currentPercentage = character.healthBar.current / character.healthBar.max
            const rage = ((damage / character.healthBar.max) * 100) * (2 - currentPercentage)
            character.classBar.increase(
                Math.floor(rage)
            )

            if (character.classBar.current >= character.classBar.max) {
                character.addBuff(new Enrage())
            }
        })
    }
}

class RecklessStrike extends Skill {
    name: string = "Reckless Strike";
    energyCost: number = 2;
    cooldown: number = 1000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    selfDamageAmount = 5

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.takeDamage(this.selfDamageAmount, castBy, DamageType.BLEED);
        targets.forEach((target) => target.takeDamage(10, castBy, DamageType.PHYSICAL))
    }

    override canCast(castBy: Character): boolean {
        if (castBy.healthBar.current < this.selfDamageAmount) {
            return false
        }

        return super.canCast(castBy)
    }
}

class RagingBlow extends Skill {
    name: string = "Raging Blow";
    energyCost: number = 4;
    cooldown: number = 4 * 1000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.takeDamage(14, castBy, DamageType.PHYSICAL))

        if (castBy.classBar != null) {
            castBy.classBar.increase(14)

            if (castBy.classBar.current >= castBy.classBar.max) {
                castBy.addBuff(new Enrage())
            }
        }
    }
}

class Rampage extends Skill {
    name: string = "Rampage";
    energyCost: number = 6;
    cooldown: number = 6 * 1000;
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        const missingHealthPercentage = (castBy.healthBar.current / castBy.healthBar.max);
        const damageToDeal = Math.ceil(16 * (2 - missingHealthPercentage))
        const threatModifier = 3 * missingHealthPercentage

        targets.forEach((target) => target.takeDamage(damageToDeal, castBy, DamageType.PHYSICAL, threatModifier))
    }
}
