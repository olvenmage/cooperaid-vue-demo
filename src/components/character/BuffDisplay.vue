<script setup lang="ts">
import type Buff from '@/types/buff';
import type Character from '@/types/character';
import type Healthbar from '@/types/health-bar';
import type CharacterState from '@/types/state/character-state';
import type { BuffState } from '@/types/state/character-state';
import { ref, watchEffect } from 'vue';

const props = defineProps<{
    character: Character
}>()


const buffs = ref<BuffState[]>([])

setInterval(() => buffs.value = props.character.buffs.getState(), 200 )


</script>

<template>
    <div class="buff-container panel">
      <template v-for="buff in buffs">
        <div class="buff" v-if="buff.imagePath">
          <img :src="`/src/assets${buff.imagePath}`" class="buff-image">
          <span v-if="buff.showDuration" class="buff-duration game-font">{{ buff.durationLeft / 1000 }}</span>
        </div>
      </template>
    </div>
</template>

<style scoped>
.buff {
  width: 50px;
  height: 50px;
}


.buff-container {
  display: flex;
  align-items: flex-start;
  flex-wrap: nowrap;
  background: rgba(255, 255, 255, 0.3) !important;
  margin-bottom: 0px !important;
  text-align: center;
}

.buff-image {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  width: 80%;
  height: 80%;
  z-index: 1;
}

.buff-duration {
  width: 100%;
  height: 100%;
  z-index: 2;
  color: black;
  font-weight: 1400;
  font-size: 12px;
  pointer-events: none;
}
</style>