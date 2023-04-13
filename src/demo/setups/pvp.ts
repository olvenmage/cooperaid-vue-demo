import { CombatEncounter, ShopEncounter } from "@/core/encounter";
import Game from "@/core/game";

import Enemy from "@/types/enemy";
import type Identity from "@/types/identity";
import Player from "@/types/player";

export default function pvpSetup(playerClass: any, enemyClass: any) {
    Game.startGame({
        players: [
           
            playerClass instanceof Player ? playerClass : new Player(new (playerClass as any)()),
        ],
        route: [
          new CombatEncounter([
            enemyClass instanceof Enemy ? enemyClass : new Enemy(new (enemyClass as any)()),
          ]),
          new ShopEncounter([])
        ]
    })
}