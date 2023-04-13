import type Character from '../character'
import Skill, { AiTargetting, TargetType } from '../skill';
import PlayerIdentity, { PlayerClass } from '../player-identity'
import ClassBar from '../class-bar';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';

export default class Rogue extends PlayerIdentity {
    public name = "Rogue"
    public baseStats = CharacterStats.fromObject({ maxHealth: 35, armor: 2})
    public maxHealth = 35
    public imagePath = "/src/assets/classes/rogue.png"
    public playerClass = PlayerClass.ROGUE
    public armor = 2

    override onCreated(character: Character) {
        character.classBar = new ClassBar(100, 'black')
    }

    public skills = [
        new Stab(),
    ]
}

class Stab extends Skill {
    name: string = "Stab";
    energyCost: number = 2;
    cooldown: number = 0;
    castTime = 1000
    targetType: TargetType = TargetType.TARGET_ENEMY
    aiTargetting = AiTargetting.RANDOM

    castSkill(castBy: Character, targets: Character[]): void {
        targets.forEach((target) => target.takeDamage(5 + target.stats.armor.value, castBy, DamageType.PHYSICAL))
    }
}