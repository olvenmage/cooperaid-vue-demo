
import type Character from '../character';
import Identity from '../identity';
import Skill, { TargetType } from '../skill';
import EnergyBar from '../energy-bar';
import Healthbar from '../health-bar';
import DamageType from '../damage-type';
import CharacterStats from '../character-stats';

export default class TrainingDummy extends Identity {
    public name = "Training Dummy"
    public baseStats = CharacterStats.fromObject({ maxHealth: 200, armor: 1 })
    public imagePath = "/src/assets/training-dummy.png"

    public skills = []
}