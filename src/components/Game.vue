<script setup lang="ts">
import { ref } from 'vue'
import Battlefield from './Battlefield.vue'
  
import Enemy from '../types/enemy';
import Goblin from '../types/enemies/goblin';
import Player from '../types/player'
import Barbarian from '../types/classes/barbarian';
import Juggernaut from '../types/classes/juggernaut';
import Game, { GameState } from '@/core/game';
import Paladin from '@/types/classes/paladin';
import Rogue from '@/types/classes/rogue';
import DragonBoss from '@/types/enemies/dragon-boss';
import DragonEgg from '@/types/enemies/dragon-egg';
import Shop from './Shop.vue'

import { CombatEncounter, ShopEncounter } from '@/core/encounter'
import GameoverScreen from './GameoverScreen.vue';
import Taunt from '@/types/skills/taunt';
import Lobby from '@/components/setup/Lobby.vue';
import ChooseRewardScreen from './ChooseRewardScreen.vue';

let state = ref(Game.state)

Game.onStateChanged(() => state.value = Game.state)
</script>

<template>
  <section style="width: 100%; height: 100%;">

    <GameoverScreen v-if="state == GameState.GAME_OVER"></GameoverScreen>
    <Battlefield v-else-if="state == GameState.IN_COMBAT"></Battlefield>
    <Shop v-else-if="state == GameState.IN_SHOP"></Shop>
    <Lobby v-else-if="state == GameState.IN_LOBBY"></Lobby>
    <ChooseRewardScreen v-else-if="state == GameState.CHOOSING_REWARD"></ChooseRewardScreen>
    <div v-else>
      <h1> Cooperaid </h1>
    </div>
  </section>
</template>