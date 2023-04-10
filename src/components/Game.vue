<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import Battlefield from './Battlefield.vue'
  
import Enemy from '../types/enemy';
import Goblin from '../types/enemies/goblin';
import Player from '../types/player'
import Barbarian from '../types/classes/barbarian';
import Guardian from '../types/classes/guardian';
import Game from '@/core/game';

const enemies: Enemy[] = [
    new Enemy(new Goblin()),
    new Enemy(new Goblin()),
    new Enemy(new Goblin()),
].map((char) => reactive(char));

const players = [
  new Player(new Barbarian()),
  new Player(new Guardian()),
].map((char) => reactive(char));


Game.startCombat(players, enemies)
</script>

<template>
  <section>
    <Battlefield></Battlefield>
  </section>
</template>