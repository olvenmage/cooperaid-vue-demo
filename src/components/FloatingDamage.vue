<script setup lang="ts">
import Game from '@/core/game';
import Player from '@/types/player';
import type OnDamageTrigger from '@/types/triggers/on-damage-trigger';
import randomRange from '@/utils/randomRange';
import { onMounted, ref } from 'vue';
import PlayerCharacter from './PlayerCharacter.vue';

const props = defineProps<{
  damage: OnDamageTrigger
}>()

const style = ref({
  left: randomRange(20, 200) + "px",
  top: randomRange(10, 60) + "px",
  fontSize: "40px",
  color: 'white'
})

onMounted(() => {
  if (props.damage.damagedBy instanceof Player ) {
    style.value.color = props.damage.damagedBy.playerColor;
  }
  setTimeout(() => {
    style.value.fontSize = '43px'
  }, 200);

  setTimeout(() => {
    style.value.fontSize = '46px'
  }, 500);

  setTimeout(() => {
    style.value.fontSize = '49px'
  }, 800);
})

</script>

<template>
  <div :style="style" class="damage-float">
    -{{ damage.actualDamage }}
  </div>
</template>

<style scoped>
.damage-float {
  -webkit-text-stroke-width: 2px;
  -webkit-text-stroke-color: black;
  font-weight: 800;
  z-index: 10;
  position: absolute;
  transition: font-size 0.3s; /* transition is set to 'font-size 12s' */
}
</style>