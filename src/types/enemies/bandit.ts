
import type Character from '../character';
import Identity from '../identity';
import Skill, { SkillRange, TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import SkillData from '../skill-data';
import Game from '@/core/game';

export default class Bandit extends Identity {
    public name = "Bandit"
    public baseStats = new CoreStats({
        constitution: 8,
        strength: 10,
        dexterity: 11,
        intelligence: 4
    })
    public imagePath = "/enemies/bandit.png"

    public skills = [
        new Slice(),
        new GangUp()
    ]
}

class GangUp extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Gang Up",
        energyCost: 7,
        cooldown: 12 * 1000,
        castTime: 6 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        const battle = Game.currentBattle

        let damage = 0
        if (!battle) {
            damage = 4
        } else {
            damage = battle.combatants.filter((c) => !c.dead && !c.isEnemyTo(castBy)).length * 3
        }

        castBy.dealDamageTo({ amount: damage, targets, type: DamageType.PHYSICAL })
    }
}


class Slice extends Skill {
    public baseSkillData: SkillData = new SkillData({
        name: "Slice",
        energyCost: 3,
        cooldown: 0 * 1000,
        castTime: 4 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.PHYSICAL,
        imagePath: null,
        range: SkillRange.MELEE,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: 5, targets, type: DamageType.PHYSICAL })
    }
}