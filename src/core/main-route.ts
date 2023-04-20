import type Encounter from "./encounter";
import { CombatEncounter, TestEncounter } from '@/core/encounter';
import Enemy from '@/types/enemy';
import DragonBoss from '@/types/enemies/dragon-boss';
import DragonEgg from '@/types/enemies/dragon-egg';
import Goblin from '@/types/enemies/goblin';
import Gryphon from "@/types/enemies/gryphon";
import Barbarian from "@/types/classes/barbarian";
import Halbadier from "@/types/enemies/halbadier";

const mainRoute: Encounter[] = [
    new TestEncounter(),
    new CombatEncounter(
      [
        new Enemy(new Halbadier()),
        new Enemy(new Gryphon()),
        new Enemy(new Halbadier()),
      ]
    )
]

export default mainRoute