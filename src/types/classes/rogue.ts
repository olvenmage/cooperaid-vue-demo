import type Character from '../character'
import Skill, { AiTargetting, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';
import DismantleBuff from '../buffs/dismantle';
import SappedBuff from '../buffs/sapped';
import PoisonBuff from '../buffs/poison';
import FocusBar from '../special-bar/focus-bar'
import SkillData from '../skill-data';
import AdrenalineRush from '../buffs/adrenaline-rush';

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
        character.classBar = new FocusBar()

        if (character.classBar != null) {
            character.classBar.onFilled = () => {
                if (character.classBar == null || character.classBar.activated) return
                character.addBuff(new AdrenalineRush(), character)
            }
        }
    }

    public skills = [
        new FanOfKnives(),
        new Dismantle(),
        new Kick(),
        new SleepDart()
    ]
}

export class FanOfKnives extends Skill {
    skillData: SkillData = new SkillData({
        name: "Fan of Knives",
        energyCost: 3,
        cooldown: 1.5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1000,
        imagePath: "/rogue/blade-flurry.png"
    })

    AMOUNT_OF_ATTACKS = 3
    DAMAGE_PER_ATTACK = 3
    MS_DELAY_BETWEEN_ATTACK = 50

    FOCUS_PER_ACTUAL_DAMAGE_DEALT = 2

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            for (let i = 0; i < this.AMOUNT_OF_ATTACKS; i++) {
                setTimeout(() => {
                    const damageResult = castBy.dealDamageTo({
                        amount: this.DAMAGE_PER_ATTACK,
                        target,
                        type: DamageType.PHYSICAL,
                        threatModifier: 1.1,
                        minAmount: 1
                    })

                    if (damageResult && castBy.classBar instanceof FocusBar) {
                        castBy.classBar.increase(damageResult.actualDamage * this.FOCUS_PER_ACTUAL_DAMAGE_DEALT)
                    }
                }, i * this.MS_DELAY_BETWEEN_ATTACK)
            }
        })
    }
}

export class Dismantle extends Skill {
    skillData: SkillData = new SkillData({
        name: "Dismantle",
        energyCost: 5,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.HIGHEST_THREAT,
        castTime: 500,
        imagePath: "/rogue/dismantle.png"
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(4)
            }

            target.addBuff(new DismantleBuff(), castBy)
        })
    }
}

export class PoisonedStrike extends Skill {
    skillData: SkillData = new SkillData({
        name: "Poisoned Strike",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1000,
        imagePath: "/rogue/poisoned-strike.png"
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(2)
            }

            castBy.dealDamageTo({ target, type: DamageType.PHYSICAL, amount: 4 })
            target.addBuff(new PoisonBuff(1, 6 * 1000, 3), castBy)
        })
    }
}

export class Kick extends Skill {
    skillData: SkillData = new SkillData({
        name: "Kick",
        energyCost: 4,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 250,
        imagePath: "/rogue/kick.png"
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: 8, target, type: DamageType.PHYSICAL, threatModifier: 1.3 })

            if (castBy.classBar instanceof FocusBar) {
                castBy.classBar.increase(4)
            }
            
            if (target.castingSkill != null) {
                target.castingSkill.interupt()

                if (castBy.classBar instanceof FocusBar) {
                    castBy.classBar.increase(10)
                }
            }
        })
    }
}

export class SleepDart extends Skill {
    skillData: SkillData = new SkillData({
        name: "Sleep Dart",
        energyCost: 6,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        aiTargetting: AiTargetting.RANDOM,
        castTime: 1000,
        imagePath: "/rogue/sleep-dart.png"
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new SappedBuff(), castBy)
            target.ai?.raiseThreat(castBy, 25)
        })
    }
}

