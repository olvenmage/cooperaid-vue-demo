<script setup lang="ts">
import { ref } from 'vue'
import Battlefield from './Battlefield.vue'
  
import Enemy from '../types/enemy';
import Goblin from '../types/enemies/goblin';
import Player from '../types/player'
import Barbarian from '../types/classes/barbarian';
import Juggernaut from '../types/classes/juggernaut';
import Game from '@/core/game';
import Paladin from '@/types/classes/paladin';
import DragonBoss from '@/types/enemies/dragon-boss';
import Shop from './Shop.vue'

import { CombatEncounter, ShopEncounter } from '@/core/encounter'
import GameoverScreen from './GameoverScreen.vue';

Game.startGame({
    players: [
        new Player(new Paladin()).enableAI(),
        new Player(new Juggernaut()).enableAI(),
        new Player(new Paladin()).enableAI(),
    ],
    route: [
      new CombatEncounter([
        new Enemy(new DragonBoss()),
      ]),
      new CombatEncounter([
        new Enemy(new Goblin()),
        new Enemy(new Goblin()),
      ]),
      new ShopEncounter([])
    ]
})

let inCombat = ref(Game.inCombat)
let inShop = ref(Game.inShop)
let isGameover = ref(Game.isGameover)

Game.onCombatChanged(() => inCombat.value = Game.inCombat)
Game.onGameover(() => isGameover.value = Game.isGameover)
Game.onShopChanged(() => inShop.value = Game.inShop)
</script>

<template>
  <section>

    <GameoverScreen v-if="isGameover"></GameoverScreen>
    <Battlefield v-else-if="inCombat"></Battlefield>
    <Shop v-else-if="inShop"></Shop>
  </section>
</template>