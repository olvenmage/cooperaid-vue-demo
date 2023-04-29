import type Character from '../character'
import Skill, { AiTargetting, SkillRange, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import CharacterStats, { CoreStats } from '../character-stats';
import DismantleBuff from '../buffs/dismantle';
import type EmpowerableSKill from '../skill-types/empowerable-skill';
import FrozenBuff from '../buffs/frozen'
import SkillData from '../skill-data';
import EmpowerBar from '../special-bar/empower-bar';
import GameSettings from '@/core/settings';

export default class Mage extends PlayerIdentity {
    public name = "Mage"
    public baseStats = new CoreStats({
        baseHealth: 1000,
        baseCrit: GameSettings.basePlayerCritChance,
        constitution: 6,
        strength: 10,
        dexterity: 10,
        intelligence: 18
    })
    public imagePath = "/classes/mage.png"
    public playerClass = PlayerClass.MAGE
    public basicSkills: Skill[] = [new FrostBolt()]
    public color = "#51A5C5";
    public description: string = "The mage wields great and powerful arcane magic to incinerate their enemies or freeze them in place. To avoid interference with their spellcasting, the mage only wears cloth armor, but arcane shields and enchantments gives them and their allies additional protection."

    override onCreated(character: Character) {
        character.classBar = new EmpowerBar()

        character.classBar.onFilled = () => {
            character.classBar?.activate(character)
        }
    }

    public skills = []

    possibleSkills: Skill[] = [];
}

export class FrostBolt extends Skill implements EmpowerableSKill {
    baseSkillData: SkillData = new SkillData({
        name: "Frostbolt",
        energyCost: 2,
        cooldown: 0 * 1000,
        targetType: TargetType.TARGET_ENEMY,
        damageType: DamageType.MAGICAL,
        castTime: 1000,
        imagePath: "/mage/frost-bolt.png",
        range: SkillRange.RANGED,
    })

    castSkill(castBy: Character, targets: Character[]): void {
        castBy.dealDamageTo({ amount: 700, type: DamageType.MAGICAL, targets })

        targets.forEach((target) => {
            if (this.skillData.isTransformed) {
                target.addBuff(new FrozenBuff(), castBy)
            }
        })

        if (!this.skillData.isTransformed && castBy.classBar != null) {
            castBy.classBar.increase(25)
        }
    }

    empower(castBy: Character): void {
        this.skillData.transform({
            name: "Frost Tomb",
            imagePath: "/mage/frost-tomb.png",
            energyCost: 4,
        })
    }

    unempower(castBy: Character): void {
        this.skillData.transformBack()
    }
}