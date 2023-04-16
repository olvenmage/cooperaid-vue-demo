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
import Rogue from '@/types/classes/rogue';
import DragonBoss from '@/types/enemies/dragon-boss';
import DragonEgg from '@/types/enemies/dragon-egg';
import Shop from './Shop.vue'

import { CombatEncounter, ShopEncounter } from '@/core/encounter'
import GameoverScreen from './GameoverScreen.vue';
import Taunt from '@/types/skills/taunt';
import main from '@/demo/entry/main';
import Lobby from '@/components/setup/Lobby.vue';

main()

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
    <Lobby v-else></Lobby>
  </section>
</template>