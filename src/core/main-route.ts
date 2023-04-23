import type Encounter from "./encounter";
import { CombatEncounter, RewardEncounter, TestEncounter } from '@/core/encounter';
import Enemy from '@/types/enemy';
import DragonBoss from '@/types/enemies/dragon-boss';
import DragonEgg from '@/types/enemies/dragon-egg';
import Goblin from '@/types/enemies/goblin';
import Gryphon from "@/types/enemies/gryphon";
import Barbarian from "@/types/classes/barbarian";
import Halbadier from "@/types/enemies/halbadier";
import Archer from "@/types/enemies/archer";
import Bandit from "@/types/enemies/bandit"
import Rogue from "@/types/classes/rogue";
import Paladin from "@/types/classes/paladin";

const mainRoute: Encounter[] = [
    new CombatEncounter([
      new Enemy(new Goblin()),
      new Enemy(new Goblin()),
      new Enemy(new Goblin()),
    ]),
    new RewardEncounter(),
    new CombatEncounter([
      new Enemy(new Bandit()),
      new Enemy(new Bandit()),
      new Enemy(new Bandit()),
      new Enemy(new Bandit()),
    ]),
    new RewardEncounter(),
    new CombatEncounter(
      [
        new Enemy(new Halbadier()),
        new Enemy(new Archer())
      ]
    ),
    new RewardEncounter(),
    new CombatEncounter(
      [
        new Enemy(new Gryphon()),
      ]
    ),
    new RewardEncounter(),
    new CombatEncounter(
      [
        new Enemy(new Halbadier()),
        new Enemy(new Halbadier()),
        new Enemy(new Gryphon()),
        new Enemy(new Archer())
      ]
    ),
    new RewardEncounter(),
    new CombatEncounter([
      new Enemy(new DragonEgg()),
      new Enemy(new DragonBoss()),
      new Enemy(new DragonEgg()),
    ])
]

export default mainRoute