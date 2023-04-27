<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type Character from '../types/character';
import Healthbar from "./character/Healthbar.vue";
import Energybar from "./character/Energybar.vue";
import Classbar from "./character/Classbar.vue";
import SavingGrace from '@/types/buffs/saving-grace';
import CharacterSprite from './CharacterSprite.vue';
import type OnDamageTrigger from '@/types/triggers/on-damage-trigger';
import FloatingDamage from './FloatingDamage.vue';
import GameSettings from '@/core/settings';
import CharacterAI from '@/types/threat-table';
import ThreatTable from '@/types/threat-table';
import { CHARACTER_TRIGGERS } from '@/types/character-triggers';

const props = defineProps<{
  character: Character,
  color?: string,
  hideName?: boolean
}>()

const damageFloats = ref<OnDamageTrigger[]>([]);
const aiEnabled = ref(props.character.threat != null)

onMounted(() => {
  props.character.triggers.on(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, addDamageFloat)
})

onUnmounted(() => {
  props.character.triggers.off(CHARACTER_TRIGGERS.ON_DAMAGE_TAKEN, addDamageFloat)
})

function toggleAI() {
  if (aiEnabled.value) {
    props.character.threat = new ThreatTable()
  } else {
    props.character.threat = null
  }
}

function addDamageFloat(trigger: OnDamageTrigger) {
  console.log("FLOATIE!")
  console.log(`dodged: ${trigger.isDodged}`)
  console.log("----")
  if (trigger.actualDamage <= 0 && !trigger.isDodged) {
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
        <div v-if="!hideName" class="char-name" :class="{'char-dead' : character.dead}" :style="{color: color}">{{ character.identity.name }}</div>

        <div class="damage-floats">
            <FloatingDamage v-for="damageFloat in damageFloats" :key="damageFloat.id" :damage="damageFloat"></FloatingDamage>
        </div>
        <CharacterSprite style="margin-top: 10px; height: 80%;" width="80%" height="80%" :character="character">
          <div class="stat-wrapper">
            <div class="stat-item">
              <img class="armor" width="16" height="16" src="/src/assets/icons/magical-armor-symbol.png" alt="">
              <span style="font-size: 22px; margin-right: 8px">{{ character.stats.derived.magicalArmor.value }}</span>
            </div>
            <div class="stat-item">
              <img class="armor" width="16" height="16" src="/src/assets/icons/armor-symbol.png" alt="">
              <span style="font-size: 22px">{{ character.stats.derived.armor.value }}</span>
            </div>
            <div class="stat-item">
              <img class="armor" width="16" height="16" src="/src/assets/icons/energy-boost-symbol.png" alt="">
              <span style="font-size: 22px">{{ character.stats.derived.energyRegenHaste.value }}</span>
            </div>
          
            <div class="stat-item">
              <img class="armor" width="16" height="16" src="/src/assets/icons/speed-icon.png" alt="">
              <span style="font-size: 22px">{{ character.stats.derived.castSpeed.value }}</span>
            </div>
        </div>
      </CharacterSprite>
        <div v-if="!hideName" style="position: absolute; left: 2px; bottom: 0px">
          AI
          <input type="checkbox" v-model="aiEnabled" @change="toggleAI">
        </div>
      
        
      </div>
</template>

<style scoped>

.stat-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}

.stat-item {
  flex-grow: 1;
  max-width: 100%;
  height: auto;
  line-height: 22px;
  display: flex;
  justify-content: center;
  align-items: center; /* align vertical */
}

.char-name {
  text-align: center;
  position: absolute;
  z-index: 3;
  font-weight: 800;
  font-size: 26px;
  top: -26px;
  -webkit-text-stroke-width: 2px;
  -webkit-text-stroke-color:  black;
}

.char-dead {
  filter: grayscale(50%);
}

.char-window {

  display: flex;
  justify-content: center;
  color: black;
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