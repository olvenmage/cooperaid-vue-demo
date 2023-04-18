import type Character from '../character'
import Skill, { AiTargetting, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import Ferocious from '../buffs/ferocious';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';
import type EmpowerableSKill from '../empowerable-skill';
import SkillData from '../skill-data';
import FerocityBar from '../special-bar/ferocity-bar'
import ThornsBuff from '../buffs/thorns-buff';
import ThickSkinBuff from '../buffs/thick-skin';
import NaturesProtectionBuff from '../buffs/nature-her-protection';
import Game from '@/core/game';
import { globalThreatEvent } from '@/core/events';
import Taunt from '../skills/taunt';
import RegrowthBuff from '../buffs/regrowth';

export default class Druid extends PlayerIdentity {
    public name = "Druid"
    public baseStats = CharacterStats.fromObject({ maxHealth: 35, armor: 1, magicalArmor: 1})
    public imagePath = "/classes/druid.png"
    public playerClass = PlayerClass.DRUID
    public basicSkill: Skill = new CommandNature()
    public color = "#105E26";

    override onCreated(character: Character) {
        character.classBar = new FerocityBar()
        if (character.classBar != null) {
            character.classBar.onFilled = () => {
                if (character.classBar == null || character.classBar.activated) return
                character.addBuff(new Ferocious(), character)
            }
        }
    }

    public skills = [
        new Thorns(),
        new Regrowth()
    ]
}

export class CommandNature extends Skill implements EmpowerableSKill {
    skillData: SkillData = new SkillData({
        name: "Command Nature",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ANY,
        castTime: 1250,
        imagePath: "/druid/command-nature.png"
    })

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        if (this.skillData.isTransformed) {
            targets.forEach((target) => {
                castBy.dealDamageTo({ amount: 12, type: DamageType.PHYSICAL, target, threatModifier: 1.5})
            })
    
        } else {
            targets.forEach((target) => {
                if (target.isEnemyTo(castBy)) {
                    castBy.dealDamageTo({ amount: 5, type: DamageType.MAGICAL, target})

                } else {
                    target.addBuff(new NaturesProtectionBuff(), castBy)
                    Game.eventBus.publish(globalThreatEvent({ healer: target, amount: 4}))
                }
            })
    
        }
      
        if (!this.empowered && castBy.classBar != null) {
            castBy.classBar.increase(10)
        }
    }

    getCastPriority(castBy: Character, target: Character): number {
        return 20
    }

    empower(castBy: Character): void {
        this.skillData.transform({
            name: "Swipe",
            energyCost: 3,
            targetType: TargetType.TARGET_ENEMY,
            imagePath: "/druid/bear/swipe.png",
            castTime: 1000
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.skillData.transformBack()
    }
}

export class Thorns extends Skill implements EmpowerableSKill {
    skillData: SkillData = new SkillData({
        name: "Thorns",
        energyCost: 2,
        cooldown: 11 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        castTime: 1650,
        imagePath: "/druid/thorns.png"
    })

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        if (this.skillData.isTransformed) {
            castBy.addBuff(new ThickSkinBuff(), castBy)
        } else {
            targets.forEach((target) => {
                target.addBuff(new ThornsBuff(), castBy)
                Game.eventBus.publish(globalThreatEvent({ healer: target, amount: 12}))
            })

            if (castBy.classBar instanceof FerocityBar) {
                castBy.classBar.increase(12)
            }
        }
    }

    empower(castBy: Character): void {
        this.skillData.transform({
            name: "Thick Skin",
            energyCost: 4,
            targetType: TargetType.TARGET_NONE,
            imagePath: "/druid/bear/thick-skin.png",
            castTime: 1000
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.skillData.transformBack()
    }
}

export class Regrowth extends Skill implements EmpowerableSKill {
    skillData: SkillData = new SkillData({
        name: "Regrowth",
        energyCost: 3,
        cooldown: 8 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        castTime: 1650,
        imagePath: "/druid/regrowth.png"
    })

    empowered = false

    castSkill(castBy: Character, targets: Character[]): void {
        if (this.skillData.isTransformed) {
            if (castBy.classBar instanceof FerocityBar) {
                castBy.classBar.decrease(25)
            }
        } else {
            targets.forEach((target) => {
                target.addBuff(new RegrowthBuff(), castBy)
            })

            if (castBy.classBar instanceof FerocityBar) {
                castBy.classBar.increase(6)
            }
        }
    }

    empower(castBy: Character): void {
        this.skillData.transform({
            name: "Calm",
            energyCost: 3,
            targetType: TargetType.TARGET_NONE,
            imagePath: "/druid/bear/calm.png",
            castTime: 1000,
            canCastOnCooldown: true
        })

        this.empowered = true
    }

    unempower(castBy: Character): void {
        this.empowered = false
        this.skillData.transformBack()
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}