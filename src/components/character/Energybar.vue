<script setup lang="ts">
import type EnergyBar from '@/types/energy-bar';
import { ref, watchEffect } from 'vue';

const props = defineProps<{
    energyBar: EnergyBar
}>()


let barWidth = ref("0%");

watchEffect(() => {
 // damage = 100;
    // calculate the percentage of the total width
    let perc = (props.energyBar.current / props.energyBar.max) * 100;

    if (perc < 0) {
        perc = 0;
    }

    barWidth.value = perc + "%";
})
   

</script>

<template>
    <div class="energy-bar">
      
        <div class="bar" :style="{ width: barWidth}">
          <span style="color: black; position: absolute; bottom: -7px; text-align: center">{{ energyBar.current }}</span>
        </div>
        
    </div>
</template>

<style scoped>
.energy-bar {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  width: 200px;
  height: 20px;
  padding: 5px;
  background: #ddd;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  position: relative;
}
.bar {
  background: lightsteelblue;
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