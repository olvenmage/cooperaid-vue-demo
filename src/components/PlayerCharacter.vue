<script setup lang="ts">
import type Player from '../types/player';
import type Skill from '../types/skill';
import { defineEmits } from 'vue'
import BattlefieldCharacter from './BattlefieldCharacter.vue';

defineProps<{
  player: Player
}>()

const emit = defineEmits(['start-cast'])

function startCast(skill: Skill) {
  emit('start-cast', skill)
}

</script>

<template>
  <div>
    <span :style="{color: player.playerColor}">Player {{ player.playerNumber }}</span>
    <BattlefieldCharacter :character="player" @start-cast="startCast">

</BattlefieldCharacter>

  </div>

</template>