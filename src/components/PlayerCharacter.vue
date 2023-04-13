<script setup lang="ts">
import type Player from '../types/player';
import type Skill from '../types/skill';
import { defineEmits } from 'vue'
import BattlefieldCharacter from './BattlefieldCharacter.vue';

defineProps<{
  player: Player,
  castingSkill: Skill|null
}>()

const emit = defineEmits(['start-cast'])

function startCast(skill: Skill) {
  emit('start-cast', skill)
}

</script>

<template>
  <div>
    <h1 class="player-name" :style="{color: player.playerColor}">Player {{ player.playerNumber }}</h1>
    <BattlefieldCharacter :casting-skill="castingSkill" :character="player" @start-cast="startCast"></BattlefieldCharacter>
  </div>

</template>

<style scoped>
.player-name {
  font-size: 20px;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}
</style>