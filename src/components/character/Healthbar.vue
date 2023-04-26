<script setup lang="ts">
import type Healthbar from '@/types/health-bar';
import { ref, watchEffect } from 'vue';
const props = defineProps<{
    healthBar: Healthbar,
    savingGrace: boolean,
    pulses?: boolean
}>()


const colorMap = {
  healthy: "#66923d",
  damaged: "#CDC23D",
  low: "#FF9500",
  critical: "#FF1300",
}

let barWidth = ref("100%");

let healthBarColor = ref(colorMap.healthy)

watchEffect(() => {
 // damage = 100;
    // calculate the percentage of the total width
    let perc = (props.healthBar.current / props.healthBar.max) * 100;

    if (perc < 0) {
        perc = 0;
    }

    if (perc > 80) {
      healthBarColor.value = colorMap.healthy
    } else if (perc > 60) {
      healthBarColor.value = colorMap.damaged
    } else if (perc > 30) {
      healthBarColor.value = colorMap.low
    } else {
      healthBarColor.value = colorMap.critical
    }

    barWidth.value = perc + "%";
})
   

</script>

<template>
    <div class="health-bar">
        <div class="bar" :class="{critical: pulses && barWidth != '0%' && healthBarColor == colorMap.critical}" :style="{ width: barWidth, background: healthBarColor}"></div>
        <div
          class="health-text"
          :style="{ color: savingGrace ? 'darkgoldenrod' : 'black'}"
          >
          {{ healthBar.current }}/{{ healthBar.max }}
    </div>
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

.health-text {
  position: absolute;
  bottom: 0px;
  text-align: center;
  width: 100%;
}

.bar {
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


.bar.critical {
  animation: pulse-red .5s infinite;
}


@keyframes pulse-red {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 82, 82, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
  }
}
</style>