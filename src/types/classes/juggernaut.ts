import type Character from '../character'
import Skill, { AiTargetting, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import Enrage from '../buffs/enrage';
import DamageType from '../damage-type';
import type OnDamageTrigger from '../triggers/on-damage-trigger';
import ShieldBlockBuff from '../buffs/shield-block';
import Untouchable from '../buffs/untouchable';
import CharacterStats from '../character-stats';


export default class Juggernaut extends PlayerIdentity {
    public name = "Juggernaut"
    public baseStats = CharacterStats.fromObject({ maxHealth: 52, armor: 3})
    public imagePath = "/src/assets/classes/juggernaut.png"
    public playerClass = PlayerClass.JUGGERNAUT

    override onCreated(character: Character) {
        character.classBar = new ClassBar(100, 'silver')

        character.classBar.onFilled = () => {
            if (character.classBar == null || character.classBar.activated) return
            character.addBuff(new Untouchable(), character)
        }

        this.onDamageTakenTriggers.push(this.generateResistanceOnDamage)
    }

    public skills = [
        new Bash(),
        new BodySlam(),
        new ShieldBlock(),
    ]

    generateResistanceOnDamage({ character, actualDamage, originalDamage }: OnDamageTrigger) {
        const damageReduced = originalDamage - actualDamage

        if (character.classBar && damageReduced > 0) {
            let resistanceGained = (damageReduced / character.healthBar.max) * 100

            if (!character.classBar.activated) {
                resistanceGained *= 1.3
            }

            character.classBar.increase(Math.ceil(resistanceGained))
        }
    }
}

export class Bash extends Skill {
    name: string = "Bash";
    energyCost: number = 2;
    cooldown: number = 0;
    castTime = 1000
    targetType: TargetType = TargetType.TARGET_ENEMY
    aiTargetting = AiTargetting.RANDOM

    BASE_DAMAGE = 3

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({
            amount: this.BASE_DAMAGE + castBy.stats.armor.value,
            target,
            type: DamageType.PHYSICAL,
            threatModifier: 1.2
        }))
    }
}

export class ShieldBlock extends Skill {
    name: string = "Shield Block";
    energyCost: number = 4;
    cooldown: number = 6 * 1000;
    castTime = 500
    targetType: TargetType = TargetType.TARGET_NONE

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.addBuff(new ShieldBlockBuff(), castBy)
    }
}

export class BodySlam extends Skill {
    name: string = "Body Slam";
    energyCost: number = 3;
    cooldown: number = 1 * 1000;
    castTime = 1000
    targetType: TargetType = TargetType.TARGET_ENEMY

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: 5 + castBy.stats.armor.value, target, type: DamageType.PHYSICAL, threatModifier: 1.2})
            target.dealDamageTo({ amount: 5 + target.stats.armor.value, target: castBy, type: DamageType.PHYSICAL, threatModifier: 1.2})
        })
    }
}
