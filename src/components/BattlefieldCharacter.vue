<script setup lang="ts">
import type Character from '../types/character';
import type Skill from '../types/skill';
import Healthbar from "./character/Healthbar.vue";
import Energybar from "./character/Energybar.vue";
import Classbar from "./character/Classbar.vue";
import { defineEmits } from 'vue'
import Castbar from './character/Castbar.vue';
import Enemy from '@/types/enemy';

const props = defineProps<{
  character: Character
}>()

const emit = defineEmits(['start-cast'])
const isEnemy = props.character instanceof Enemy

function startCast(skill: Skill) {
  emit('start-cast', skill)
}

</script>

<template>
  <div class="char-wrapper">
    <section>
      <span :style="{color: character.dead ? 'red' : 'unset'}">{{ character.identity.name }}</span>
      <div class="image-wrapper">
        
        <img class="sprite" :src="character.identity.imagePath" style="margin: auto">
        <img class="cross-image" src="/src/assets/red-cross.png" v-if="character.dead">
        
      </div>
      <Healthbar :health-bar="character.healthBar"></Healthbar>
      <Energybar v-if="!isEnemy" :energy-bar="character.energyBar"></Energybar>
      <Castbar v-if="character.casting" :character="character"></Castbar>
      <Classbar v-if="character.classBar" :class-bar="character.classBar"></Classbar>
  </section>
  <div v-if="!isEnemy" class="char-spell-list">
    <div
      class="spell-item"
      v-for="skill in character.identity.skills"
      :style="{ background: skill.canCast(character) ? 'white' : 'gray' }"
      @click="() => startCast(skill)"
      >
    [{{ skill.energyCost }}] {{ skill.name }}
    <span style="float: right" v-if="skill.onCooldown">
    ({{ (skill.cooldown - skill.onCooldownTimer) / 1000 }})
  </span>
  </div>
  </div>
  </div>

</template>

<style scoped>
.char-spell-list {
  background: white;
  color: black;
}

.char-spell-list .spell-item:hover {
  background: lightblue
}

.char-wrapper {
  margin-left: 15px;
}

.char-wrapper .image-wrapper {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
}

.cross-image {
  position: absolute;
  top: 0px;
  left: 0px;
  opacity: 0.5;
  
  width: 100%;
  height: 100%;
}

.char-wrapper:not(.casting-character):hover {
  border: 1px solid gray;
}
</style>