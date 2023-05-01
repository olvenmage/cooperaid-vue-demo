
import type Character from '../character';
import Identity from '../identity';
import Skill, { SkillRange, TargetType } from '../skill';
import DamageType from '../damage-type';
import randomRange from '@/utils/randomRange';
import MeltedArmorBuff from '../buffs/melted-armor';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData, { DynamicSkillDataValue } from '../skill-data';
import AggressiveBuff from '../buffs/aggressive';
import StunnedBuff from '../buffs/stunned';

export default class DragonBoss extends Identity {
    public name = "Dragon"
    public baseStats = new CoreStats({
        baseHealth: 350,
        constitution: 30,
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
    public baseSkillData: SkillData = new SkillData({
        name: "Thrash",
        energyCost: 5,
        cooldown: 3 * 1000,
        castTime: 3 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        buffDuration: 0.75 * 1000,
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(2).modifiedBy('strength', 1.1)
    })

    castSkill(castBy: Character, targets: Character[]): void {
        const results = castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.PHYSICAL })

        for (const result of results) {
            if (!result.isDodged) {
                result.character.addBuff(new StunnedBuff({
                    duration: this.skillData.buffDuration
                }), castBy)
            }
        }
    }
}

export class DragonSwipe extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Swipe",
        energyCost: 8,
        cooldown: 10 * 1000,
        castTime: 2.5 * 1000,
        targetType: TargetType.TARGET_ALL_ENEMIES,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
        damage: new DynamicSkillDataValue(2).modifiedBy('strength', 1.1)
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: this.skillData.damage.value, targets, type: DamageType.PHYSICAL })
    }
}

export class DragonRoar extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Roar",
        energyCost: 0,
        cooldown: 15 * 1000,
        castTime: 1.5 * 1000,
        targetType: TargetType.TARGET_NONE,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.RANGED,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        if (castBy.identity instanceof DragonBoss) {
            castBy.addBuff(new AggressiveBuff(), castBy)
            castBy.identity.stackingFireDamage += 3
        }
    }
}


export class FireBreath extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Fire Breath",
        energyCost: 10,
        cooldown: 4 * 1000,
        castTime: 5 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.MAGICAL,
        imagePath: null,
        range: SkillRange.RANGED,
        damage: new DynamicSkillDataValue(6).modifiedBy('intelligence', 1)
    })

    castSkill(castBy: Character, targets: Character[]): void {
        const dragonIdentity = castBy.identity
        if (dragonIdentity instanceof DragonBoss) {
            castBy.dealDamageTo({
                amount: randomRange(this.skillData.damage.value, this.skillData.damage.value + dragonIdentity.stackingFireDamage),
                targets,
                type: DamageType.MAGICAL,
                noCrit: true
            })

            targets.forEach((target) => {
                target.addBuff(new MeltedArmorBuff(), castBy)
            })
        }
    }
}