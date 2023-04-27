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
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData from '../skill-data';
import HolyPowerBar from '../special-bar/holy-power-bar';
import type { AppSocketSubscription } from '@/app-socket/lib/core/types';
import OverwhelmingMartyrdom from '../skill-upgrades/paladin/overwhelming-martyrdom';
import RejuvenatingLight from '../skill-upgrades/paladin/rejuvenating-light';
import FinishingStrikeSkilGem from '../skill-upgrades/paladin/finishing-strike';
import BrandingSmiteSkillGem from '../skill-upgrades/paladin/branding-smite';
import BlessedWeaponBuff from '../buffs/blessed-weapon';
import WeaponOfRightenousnessSkillGem from '../skill-upgrades/paladin/weapon-of-righteousness';


export default class Paladin extends PlayerIdentity {
    public name = "Paladin"
    public baseStats = new CoreStats({
        constitution: 13,
        strength: 12,
        dexterity: 6,
        intelligence: 13
    })
    public imagePath = "/classes/paladin.png"
    public playerClass = PlayerClass.PALADIN
    public basicSkills: Skill[] = [new HolyShock(), new HolyStrike()]
    public color = "#ffdf00";
    public description = "The Paladin vows to protect the weak and bring justice to the unjust They are equiped with plate armor so they can confront the toughest of foes, and the blessing of their God allows them to heal wounds and wield powerful holy magic to vanquish evil."


    override onCreated(character: Character) {
        character.classBar = new HolyPowerBar()

        const unsub = Game.eventBus.subscribe(characterDiedEvent, event => {
            if (character.classBar?.isFull() && character.classBar?.activated == false) {
                if (character.isEnemyTo(event.payload.character) || !event.payload.character.dead || event.payload.character.buffs.hasBuff(SavingGrace)) {
                    return
                }

                if (character.classBar instanceof HolyPowerBar) {
                    character.classBar.saveTarget(character, event.payload.character)
                }
            }
        })

        this.onDeletedCallbacks.push(unsub)
    }

    public skills = [
        new Smite(),
    ]

    possibleSkills = [
        new OverwhelmingLight(),
        new LayOnHands(),
        new BlessingOfProtection(),
        new Smite(),
        new BlessedWeapon(),
    ]
}

export class HolyShock extends Skill {
    skillData: SkillData = new SkillData({
        name: "Holy Shock",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ANY,
        damageType: DamageType.MAGICAL,
        castTime: 1250,
        imagePath: "/paladin/holy-shock.png",
        healing: 5,
        damage: 6,
        range: SkillRange.RANGED,
    })

    description: string | null = "Basic. Deal 6 damage to an enemy or restore 5 health to an ally."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (castBy.isEnemyTo(target)) {
                castBy.dealDamageTo({ amount: this.skillData.damage, targets: [target], type: DamageType.MAGICAL})
            } else {
                target.restoreHealth(this.skillData.healing, castBy, 1.0)
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

export class HolyStrike extends Skill {
    skillData: SkillData = new SkillData({
        name: "Holy Strike",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        castTime: 1250,
        imagePath: "/paladin/holy-strike.png",
        range: SkillRange.MELEE,
        damage: 7,
        healing: 3
    })

    description: string | null = "Basic. Deal 7 damage to an enemy and restore 3 health to the lowest health ally."

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage, targets, type: DamageType.PHYSICAL, threatModifier: 1.1 })

        targets.forEach((target) => {
            const battle = Game.currentBattle

            if (battle) {
                const alliesSortedByLowHealth = battle.combatants.filter((c) => !c.isEnemyTo(castBy) && !c.dead).sort((c1, c2) => Math.sign(c1.healthBar.current - c2.healthBar.current))
                
                let healing = this.skillData.healing

                if (this.socketedUpgrade instanceof FinishingStrikeSkilGem && target.dead) {
                    healing *= 3
                }

                if (alliesSortedByLowHealth[0]) {
                    alliesSortedByLowHealth[0].restoreHealth(healing, castBy, 0.8)
                }
            }

            if (castBy.classBar != null) {
                castBy.classBar.increase(8)
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
        damageType: DamageType.MAGICAL,
        castTime: 1500,
        imagePath: "/paladin/overwhelming-light.png",
        damage: 10,
        range: SkillRange.RANGED,
    })

    description: string | null = "Deal 10 damage to any target, if they survive, heal them for double the amount."

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            if (this.socketedUpgrade instanceof OverwhelmingMartyrdom) {
                castBy.dealDamageTo({ amount: this.skillData.damage!, type: DamageType.MAGICAL, targets: [castBy], threatModifier: 0, noCrit: true })
            } else {
                castBy.dealDamageTo({ amount: this.skillData.damage!, type: DamageType.MAGICAL, targets: [target], threatModifier: 0, noCrit: true })
            }

            target.restoreHealth(this.skillData.damage! * 2, castBy, 0.6)
        })

        if (castBy.classBar != null) {
            castBy.classBar.increase(10)
        }
    }

    override getCastPriority(castBy: Character, target: Character) {
        if (castBy.isEnemyTo(target) && (target.healthBar.current < this.skillData.damage! || this.socketedUpgrade instanceof OverwhelmingMartyrdom)) {
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
        energyCost: 4,
        cooldown: 5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.MAGICAL,
        castTime: 1500,
        imagePath: "/paladin/smite.png",
        damage: 8,
        buffDuration: 6 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Smite an enemy, dealing 8 magic damage and marking them. For a duration each ally restores 2 health when they attack it."

    castSkill(castBy: Character, targets: Character[]): void {
        if (castBy.classBar) {
            castBy.classBar.increase(12)
        }

        castBy.dealDamageTo({ amount: this.skillData.damage!, targets, type: DamageType.MAGICAL})

        targets.forEach((target) => {
          
            target.addBuff(new SmittenBuff({
                duration: this.skillData.buffDuration,
                branding: this.socketedUpgrade instanceof BrandingSmiteSkillGem
            }), castBy)
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

    description: string | null = "Buff an ally to give them 2 armor for a duration"

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

export class LayOnHands extends Skill {
    skillData: SkillData = new SkillData({
        name: "Lay on Hands",
        energyCost: 0,
        cooldown: 20 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        castTime: 800,
        imagePath: "/paladin/lay-on-hands.png",
        range: SkillRange.RANGED,
    })

    description: string | null = "Spend all your energy to heal an ally for the amount * 3"

    canCast(castBy: Character): boolean {
        if (castBy.energyBar.current == 0) {
            return false
        }

        return super.canCast(castBy)
    }

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            const consumeAmount = castBy.energyBar.current
            
            target.restoreHealth(consumeAmount * 3, castBy, 0)

            if (this.socketedUpgrade instanceof RejuvenatingLight) {
                target.energyBar.increase(2)
            }

            if (castBy.classBar != null) {
                castBy.classBar.increase(consumeAmount * 3)
            }

            castBy.energyBar.decrease(consumeAmount)
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        const targetHealthPercentage = target.healthBar.current / target.healthBar.max;

        if (targetHealthPercentage < 0.5 && castBy.energyBar.current < 5) {
            return 25
        }

        if (targetHealthPercentage < 0.3 && castBy.energyBar.current > 3) {
            return 25
        }

        return 0
    }
}

export class BlessedWeapon extends Skill {
    skillData: SkillData = new SkillData({
        name: "Blessed Weapon",
        energyCost: 0,
        cooldown: 12 * 1000,
        targetType: TargetType.TARGET_FRIENDLY,
        castTime: 100,
        imagePath: "/paladin/blessed-weapon.png",
        buffDuration: 10 * 1000,
        range: SkillRange.RANGED,
    })

    description: string | null = "Buff an ally to add 3 damage to all their physical attacks."

    canCast(castBy: Character): boolean {
        if (castBy.energyBar.current == 0) {
            return false
        }

        return super.canCast(castBy)
    }

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => {
            target.addBuff(new BlessedWeaponBuff({
                duration: this.skillData.buffDuration,
                damageAmount: this.socketedUpgrade instanceof WeaponOfRightenousnessSkillGem ? 6 : 3
            }), castBy)
        })
    }

    override getCastPriority(castBy: Character, target: Character) {
        return 15;
    }
}