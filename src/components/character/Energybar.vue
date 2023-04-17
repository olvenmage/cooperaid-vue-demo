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
        <div class="bar" :style="{ width: barWidth}"  :class="{'full-energy-bar': energyBar.max == energyBar.current}">
          <div class="energy-icon-wrapper float-left">
            <img src="/src/assets/icons/energy-icon.png">
        </div>
          <span style="color: black; position: absolute; bottom: -4px; text-align: center; float: left" 
          >{{ energyBar.current }}</span>
        </div>
        
    </div>
</template>

<style scoped>
.energy-bar {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  height: 24px;
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
  height: 14px;
  position: relative;
  
  transition: width .5s linear;
}

.full-energy-bar {
  background-color: #2790C5;
  background-image: radial-gradient(ellipse at 75% -25%, rgb(14, 102, 150) 0%, transparent 50%);
  background-size: 100% 100%;
}


.energy-icon-wrapper {
  display: flex;
  justify-content: center;
  width: 16px;
  height: 20px;
  float: left;
  padding-bottom: 6px;
  padding-top: 1px
}
</style>