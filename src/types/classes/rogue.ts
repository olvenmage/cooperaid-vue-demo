import type Character from '../character'
import Skill, { AiTargetting, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';
import DismantleBuff from '../buffs/dismantle';
import SappedBuff from '../buffs/sapped';
import PoisonBuff from '../buffs/poison';

export default class Rogue extends PlayerIdentity {
    public name = "Rogue"
    public baseStats = CharacterStats.fromObject({ maxHealth: 35, armor: 2})
    public maxHealth = 35
    public imagePath = "/classes/rogue.png"
    public playerClass = PlayerClass.ROGUE
    public basicSkill: Skill = new PoisonedStrike()
    public armor = 2
    public color = "#AB6DAC";

    override onCreated(character: Character) {
        character.classBar = new ClassBar(100, 'black')
    }

    public skills = [
        new BladeFlurry(),
        new Dismantle(),
        new CheapShot(),
        new Sap()
    ]
}

export class BladeFlurry extends Skill {
    name: string = "Blade Flurry";
    energyCost: number = 3;
    cooldown: number = 1.5 * 1000;
    castTime = 1000
    targetType: TargetType = TargetType.TARGET_ENEMY
    aiTargetting = AiTargetting.RANDOM
    imagePath = "/rogue/blade-flurry.png"

    AMOUNT_OF_ATTACKS = 3
    DAMAGE_PER_ATTACK = 3
    MS_DELAY_BETWEEN_ATTACK = 50

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            for (let i = 0; i < this.AMOUNT_OF_ATTACKS; i++) {
                setTimeout(() => {
                    castBy.dealDamageTo({
                        amount: this.DAMAGE_PER_ATTACK,
                        target,
                        type: DamageType.PHYSICAL,
                        threatModifier: 1.1,
                        minAmount: 1
                    })
                }, i * this.MS_DELAY_BETWEEN_ATTACK)
            }
        })
    }
}

export class Dismantle extends Skill {
    name: string = "Dismantle";
    energyCost: number = 5;
    cooldown: number = 12 * 1000;
    castTime = 500
    targetType: TargetType = TargetType.TARGET_ENEMY
    aiTargetting = AiTargetting.HIGHEST_THREAT
    imagePath = "/rogue/dismantle.png"

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new DismantleBuff(), castBy)
        })
    }
}

export class PoisonedStrike extends Skill {
    name: string = "Poisoned Strike";
    energyCost: number = 2;
    cooldown: number = 0 * 1000;
    castTime = 1000
    targetType: TargetType = TargetType.TARGET_ENEMY
    imagePath = "/rogue/poisoned-strike.png"
    aiTargetting = AiTargetting.RANDOM

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ target, type: DamageType.PHYSICAL, amount: 4 })
            target.addBuff(new PoisonBuff(1, 6 * 1000, 3), castBy)
        })
    }
}

export class CheapShot extends Skill {
    name: string = "Kick";
    energyCost: number = 4;
    cooldown: number = 8 * 1000;
    castTime = 250
    targetType: TargetType = TargetType.TARGET_ENEMY
    imagePath = "/rogue/kick.png"
    aiTargetting = AiTargetting.RANDOM

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: 8, target, type: DamageType.PHYSICAL, threatModifier: 1.3 })
            if (target.castingSkill != null) {
                target.castingSkill.interupt()
            }
        })
    }
}

export class Sap extends Skill {
    name: string = "Sap";
    energyCost: number = 6;
    cooldown: number = 12 * 1000;
    castTime = 1000
    targetType: TargetType = TargetType.TARGET_ENEMY
    aiTargetting = AiTargetting.RANDOM
    imagePath = "/rogue/sap.png"

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new SappedBuff(), castBy)
            target.ai?.raiseThreat(castBy, 25)
        })
    }
}

