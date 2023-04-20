import type Character from '../character'
import Skill, { SkillRange, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import Game from '@/core/game';
import { characterDiedEvent, globalThreatEvent } from '@/core/events';
import SavingGrace from '../buffs/saving-grace';
import BlessingOfProtectionBuff from '../buffs/blessing-of-protection'
import SmittenBuff from '../buffs/smitten';
import CharacterStats from '../character-stats';
import SkillData from '../skill-data';


export default class Paladin extends PlayerIdentity {
    public name = "Paladin"
    public baseStats = CharacterStats.fromObject({ maxHealth: 40, armor: 2, magicalArmor: 1 })
    public imagePath = "/classes/paladin.png"
    public playerClass = PlayerClass.PALADIN
    public basicSkill: Skill = new HolyShock()
    public color = "#B59E54";
    public description = "The Paladin vows to protect the weak and bring justice to the unjust They are equiped with plate armor so they can confront the toughest of foes, and the blessing of their God allows them to heal wounds and wield powerful holy magic to vanquish evil."

    override onCreated(character: Character) {
        character.classBar = new ClassBar(100, 'gold')

        Game.eventBus.subscribe(characterDiedEvent, event => {
            if (character.classBar?.isFull() && character.classBar?.activated == false) {
                if (character.isEnemyTo(event.payload.character) || !event.payload.character.dead || event.payload.character.buffs.hasBuff(SavingGrace)) {
                    return
                }

                character.classBar.activated = true
                event.payload.character.dead = false
                event.payload.character.addBuff(new SavingGrace(), character)
                event.payload.character.healthBar.current = 1
            }
           
        })
    }

    public skills = [
        new Smite(),
        new BlessingOfProtection(),
        new OverwhelmingLight()
    ]
}

export class HolyShock extends Skill {
    skillData: SkillData = new SkillData({
        name: "Holy Shock",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ANY,
        castTime: 1250,
        imagePath: "/paladin/holy-shock.png",
        range: SkillRange.RANGED,
    })

    description: string | null = "Basic. Deal 6 damage to an enemy or restore 5 health to an ally."

    DAMAGE_AMOUNT = 6
    HEAL_AMOUNT = 5

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (castBy.isEnemyTo(target)) {
                castBy.dealDamageTo({ amount: this.DAMAGE_AMOUNT, target, type: DamageType.MAGICAL})
            } else {
                target.restoreHealth(this.HEAL_AMOUNT, castBy, 1.0)
            }

            if (castBy.classBar != null) {
                let holyPowerAmount = 8

                if (target.id == castBy.id) {
                    holyPowerAmount += 3
                }

                castBy.classBar.increase(holyPowerAmount)
            }
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}

export class OverwhelmingLight extends Skill {
    skillData: SkillData = new SkillData({
        name: "Overwhelming Light",
        energyCost: 5,
        cooldown: 7 * 1000,
        targetType: TargetType.TARGET_ANY,
        castTime: 1500,
        imagePath: "/paladin/overwhelming-light.png",
        damage: 10,
        range: SkillRange.RANGED,
    })

    description: string | null = "Deal 10 damage to any target, if they survive restore 20 health to them."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: this.skillData.damage!, type: DamageType.MAGICAL, target})
            target.restoreHealth(this.skillData.damage! * 2, castBy, 0.8)
        })

        if (castBy.classBar != null) {
            castBy.classBar.increase(10)
        }
    }

    override getCastPriority(castBy: Character, target: Character) {
        if (!castBy.isEnemyTo(target) && target.healthBar.current < this.skillData.damage!) {
            return -50
        }

        if (!castBy.isEnemyTo(target) && target.healthBar.current > this.skillData.damage!) {
            return -50
        }

        return 95 - (target.healthBar.current / target.healthBar.max * 100)
    }
}

export class Smite extends Skill {
    skillData: SkillData = new SkillData({
        name: "Smite",
        energyCost: 5,
        cooldown: 5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        castTime: 1500,
        imagePath: "/paladin/smite.png",
        damage: 10,
        buffDuration: 6 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Deal 10 magic damage to an enemy, restore 8 health to the first ally that attacks them."

    castSkill(castBy: Character, targets: Character[]): void {
        if (castBy.classBar) {
            castBy.classBar.increase(12)
        }
   
        targets.forEach((target) => {
            castBy.dealDamageTo({ amount: this.skillData.damage!, target, type: DamageType.MAGICAL})
            target.addBuff(new SmittenBuff(this.skillData.buffDuration), castBy)
        })
    }
}

export class BlessingOfProtection extends Skill {
    skillData: SkillData = new SkillData({
        name: "Blessing of Protection",
        energyCost: 3,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        castTime: 500,
        imagePath: "/paladin/blessing-of-protection.png",
        buffDuration: 8 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Buff an ally to give them 3 armor for a long duration"

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => { 
            target.addBuff(new BlessingOfProtectionBuff(this.skillData.buffDuration), castBy)
            Game.eventBus.publish(globalThreatEvent({ healer: target, amount: 8}))
            Game.eventBus.publish(globalThreatEvent({ healer: castBy, amount: 4}))
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 10
    }
}