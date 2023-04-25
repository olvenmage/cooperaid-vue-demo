<script setup lang="ts">
import type OnDamageTrigger from '@/types/triggers/on-damage-trigger';
import randomRange from '@/utils/randomRange';
import { onMounted, ref } from 'vue';

const props = defineProps<{
  damage: OnDamageTrigger
}>()

let baseFontSize = 40

if (props.damage.isCrit) {
  baseFontSize += 10
}

const style = ref({
  left: randomRange(20, 200) + "px",
  top: randomRange(10, 60) + "px",
  fontSize: `${baseFontSize}px`,
  color: 'white'
})

onMounted(() => {
  
  if (props.damage.damagedBy) {
    style.value.color = props.damage.damagedBy.identity.color;
  }
  setTimeout(() => {
    style.value.fontSize = `${baseFontSize + 3}px`
  }, 200);

  setTimeout(() => {
    style.value.fontSize = `${baseFontSize} + 6}px`
  }, 500);

  setTimeout(() => {
    style.value.fontSize = `${baseFontSize} + 9}px`
  }, 800);
})

</script>

<template>
  <div :style="style" class="damage-float">
    -{{ damage.actualDamage }}<template v-if="damage.isCrit">!</template>
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