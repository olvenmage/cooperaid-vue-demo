import type Encounter from "./encounter";
import { CombatEncounter, TestEncounter } from '@/core/encounter';
import Enemy from '@/types/enemy';
import DragonBoss from '@/types/enemies/dragon-boss';
import DragonEgg from '@/types/enemies/dragon-egg';
import Goblin from '@/types/enemies/goblin';
import Gryphon from "@/types/enemies/gryphon";
import Barbarian from "@/types/classes/barbarian";

const mainRoute: Encounter[] = [
    new TestEncounter(),
    new CombatEncounter(
        [
        new Enemy(new Barbarian()),
        ]
      ),
    new CombatEncounter(
      [
      new Enemy(new Goblin()),
      new Enemy(new Gryphon()),
      new Enemy(new Goblin()),
      ]
    )
]

export default mainRoute