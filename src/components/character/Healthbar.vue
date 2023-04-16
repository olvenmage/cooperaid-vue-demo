<script setup lang="ts">
import type Healthbar from '@/types/health-bar';
import { ref, watchEffect } from 'vue';
const props = defineProps<{
    healthBar: Healthbar,
    savingGrace: boolean
}>()


let barWidth = ref("100%");

watchEffect(() => {
 // damage = 100;
    // calculate the percentage of the total width
    let perc = (props.healthBar.current / props.healthBar.max) * 100;

    if (perc < 0) {
        perc = 0;
    }

    barWidth.value = perc + "%";
})
   

</script>

<template>
    <div class="health-bar">
        <div class="bar" :style="{ width: barWidth}"></div>
        <span
          style="position: absolute; bottom: 0px; right: 80px; text-align: center"
          :style="{ color: savingGrace ? 'darkgoldenrod' : 'black'}"
        >{{ healthBar.current }}/{{ healthBar.max }}</span>
    </div>
</template>

<style scoped>
.health-bar {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  height: 20px;
  padding: 5px;
  background: #ddd;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  position: relative;
}
.bar {
  background: #66923d;
  width: 100%;
  height: 10px;
  position: relative;
  
  transition: width .5s linear;
}

.hit {
  background: rgba(255,255,255,0.6);
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 0px;
  
  transition: width .5s linear;
}
</style>