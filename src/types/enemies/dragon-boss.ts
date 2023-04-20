
import type Character from '../character';
import Identity from '../identity';
import Skill, { TargetType } from '../skill';
import DamageType from '../damage-type';
import randomRange from '@/utils/randomRange';
import MeltedArmorBuff from '../buffs/melted-armor';
import CharacterStats from '../character-stats';
import SkillData from '../skill-data';
import AggressiveBuff from '../buffs/aggressive';

export default class DragonBoss extends Identity {
    public name = "Dragon"
    public baseStats = CharacterStats.fromObject({ maxHealth: 400, armor: 3, magicalArmor: 2 })
    public imagePath = "/enemies/dragon/dragonboss.png"

    public stackingFireDamage = 0

    public skills = [
        new DragonThrash(),
        new DragonSwipe(),
        new DragonRoar(),
        new FireBreath()
    ]
}

export class DragonThrash extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Thrash",
        energyCost: 3,
        cooldown: 2 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null
    })

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => castBy.dealDamageTo({ amount: 12, target, type: DamageType.PHYSICAL }))
    }
}

export class DragonSwipe extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Swipe",
        energyCost: 5,
        cooldown: 10 * 1000,
        castTime: 2 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        imagePath: null
    })

    castSkill(castBy: Character, targets: Character[]): void {

        targets.forEach((target) => castBy.dealDamageTo({ amount: 12, target, type: DamageType.PHYSICAL }))
    }
}

export class DragonRoar extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Roar",
        energyCost: 0,
        cooldown: 15 * 1000,
        castTime: 1 * 1000,
        targetType: TargetType.TARGET_NONE,
        imagePath: null
    })

    castSkill(castBy: Character, targets: Character[]): void {
        if (castBy.identity instanceof DragonBoss) {
            castBy.addBuff(new AggressiveBuff(), castBy)
            castBy.identity.stackingFireDamage += 2
        }
    }
}


export class FireBreath extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Fire Breath",
        energyCost: 10,
        cooldown: 4 * 1000,
        castTime: 5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        imagePath: null
    })

    castSkill(castBy: Character, targets: Character[]): void {
        const dragonIdentity = castBy.identity
        if (dragonIdentity instanceof DragonBoss) {
            targets.forEach((target) => {
                castBy.dealDamageTo({
                    amount: randomRange(18, 18 + dragonIdentity.stackingFireDamage),
                    target,
                    type: DamageType.MAGICAL
                })

                target.addBuff(new MeltedArmorBuff(), castBy)
            })
        }
       
    }
}