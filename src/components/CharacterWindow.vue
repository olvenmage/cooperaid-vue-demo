<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type Character from '../types/character';
import Healthbar from "./character/Healthbar.vue";
import Energybar from "./character/Energybar.vue";
import Classbar from "./character/Classbar.vue";
import SavingGrace from '@/types/buffs/saving-grace';
import type OnDamageTrigger from '@/types/triggers/on-damage-trigger';
import FloatingDamage from './FloatingDamage.vue';
import GameSettings from '@/core/settings';

const props = defineProps<{
  character: Character,
  color?: string
}>()

const damageFloats = ref<OnDamageTrigger[]>([]);

onMounted(() => {
  props.character.identity.onDamageTakenTriggers.push(addDamageFloat)
})

onUnmounted(() => {
  const index =  props.character.identity.onDamageTakenTriggers.findIndex((item) => item == addDamageFloat)

  if (index != -1) {
    props.character.identity.onDamageTakenTriggers.splice(index, 1)
  }
})

function addDamageFloat(trigger: OnDamageTrigger) {
  if (trigger.actualDamage <= 0) {
    return 
  }

    damageFloats.value.push(trigger)
    setTimeout(() => {
        const index = damageFloats.value.findIndex((item) => item.id == trigger.id)

        if (index != -1) {
          damageFloats.value.splice(index, 1)
        }
    }, 1000 / GameSettings.speedFactor)
}

</script>

<template>
  <div class="char-window">
        <div class="char-name" :class="{'char-dead' : character.dead}" :style="{color: color}">{{ character.identity.name }}</div>

        <div class="damage-floats">
            <FloatingDamage v-for="damageFloat in damageFloats" :key="damageFloat.id" :damage="damageFloat"></FloatingDamage>
        </div>
        
        <img class="sprite" :class="{ 'sprite-dead': character.dead }" :src="character.identity.imagePath" style="margin: auto">
        <img class="cross-image" src="/src/assets/red-cross.png" v-if="character.dead">
        <img class="stunned-image" src="/src/assets/stunned-effect.png" v-if="character.stats.stunned">
        <div class="armor-wrapper">
          <img class="armor" width="16" height="16" src="/src/assets/magical-armor-symbol.png" alt="">
          <span style="font-size: 20px; margin-right: 8px">{{ character.stats.magicalArmor.value }}</span>
          <img class="armor" width="16" height="16" src="/src/assets/armor-symbol.png" alt="">
          <span style="font-size: 20px">{{ character.stats.armor.value }}</span>
        </div>
        
      </div>
</template>

<style scoped>

.armor-wrapper {
  position: absolute;
  height: 16px;
  right: 0;
  bottom: 16px;
}

.char-name {
  text-align: center;
  position: absolute;
  z-index: 3;
  font-weight: 800;
  font-size: 25px;
  top: -26px;
  -webkit-text-stroke-width: 2px;
  -webkit-text-stroke-color: rgba(100, 100, 100, 0.5);
}

.char-dead {
  filter: grayscale(50%);
}

.char-window {
  width: 220px;
  height: 220px;
  display: flex;
  justify-content: center;
  color: black;
  background-color: rgba(200, 200, 200, 0.5);
  border: 4px solid rgba(150, 150, 150, 0.5)
}

.saving-graced.char-window {
  background-color: rgba(255, 215, 0, 0.3);
  border: 4px solid rgba(151, 129, 0, 0.5)
}

.char-window.casting-skill:hover {
  background-color: rgba(200, 200, 240, 0.7);
}

.char-window.casting-skill:hover .ch-arname {
  -webkit-text-stroke-color: rgba(200, 200, 240, 0.7);
}

.damage-floats {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 10px
}

.cross-image {
  position: absolute;
  top: 0px;
  left: 0px;
  opacity: 0.5;
  
  width: 100%;
  height: 100%;
}

.stunned-image {
  position: absolute;
  top: 0px;
  left: 0px;
  opacity: 0.7;
  z-index: 2;
  
  width: 100%;
  height: 100%;
}

.sprite-dead {
  opacity: 0.4;
  filter: alpha(opacity=40); /* msie */
}
</style>