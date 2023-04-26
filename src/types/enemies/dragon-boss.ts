
import type Character from '../character';
import Identity from '../identity';
import Skill, { SkillRange, TargetType } from '../skill';
import DamageType from '../damage-type';
import randomRange from '@/utils/randomRange';
import MeltedArmorBuff from '../buffs/melted-armor';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData from '../skill-data';
import AggressiveBuff from '../buffs/aggressive';

export default class DragonBoss extends Identity {
    public name = "Dragon"
    public baseStats = new CoreStats({
        baseHealth: 300,
        constitution: 24,
        strength: 16,
        dexterity: 12,
        intelligence: 18
    })
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
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: 12, targets, type: DamageType.PHYSICAL })
    }
}

export class DragonSwipe extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Swipe",
        energyCost: 5,
        cooldown: 10 * 1000,
        castTime: 2 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: 12, targets, type: DamageType.PHYSICAL })
    }
}

export class DragonRoar extends Skill {
    public skillData: SkillData = new SkillData({
        name: "Roar",
        energyCost: 0,
        cooldown: 15 * 1000,
        castTime: 1 * 1000,
        targetType: TargetType.TARGET_NONE,
        imagePath: null,
        range: SkillRange.RANGED,
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
        imagePath: null,
        range: SkillRange.RANGED,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        const dragonIdentity = castBy.identity
        if (dragonIdentity instanceof DragonBoss) {
            castBy.dealDamageTo({
                amount: randomRange(18, 18 + dragonIdentity.stackingFireDamage),
                targets,
                type: DamageType.MAGICAL
            })

            targets.forEach((target) => {
                target.addBuff(new MeltedArmorBuff(), castBy)
            })
        }
       
    }
}