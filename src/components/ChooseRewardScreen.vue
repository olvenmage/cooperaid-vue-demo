<script setup lang="ts">
import { nextTick, computed, onMounted, reactive, watch } from 'vue';
import Game from '@/core/game';

import PlayerSelect from './setup/PlayerSelect.vue';
import { pubUpdatePickRewardState } from '../client-socket/OutgoingMessages'
import { subChooseReward } from '../client-socket/IncomingMessages'
import HealingReward from '@/types/reward/healing-reward';
import SkillReward from '@/types/reward/skill-reward';
import GemReward from '@/types/reward/gem-reward';

const players = computed(() => Game.players.value)

const canContinue = true
const interval = setInterval(() => updateRewardsInterval(), 2000)

onMounted(() => updateRewardsInterval())

function nextEncounter(): void {
    clearInterval(interval)
    Game.nextEncounter()
}


function updateRewardsInterval() {
    const rewardOptions = [
        new HealingReward(),
        new SkillReward(),
        new GemReward(),
    ]

    for (const player of players.value) {
        if (player.state.choosingReward) {
            Game.webSocket.publish(pubUpdatePickRewardState({
                playerId: player.id,
                state: rewardOptions.map((r) => r.getState())
            }))

            const chooseRewardSubscription = Game.webSocket.subscribe(subChooseReward, async (event) => {
                const chosenReward = rewardOptions.find((reward) => reward.name == event.body.rewardName)

                if (!chosenReward) {
                  return
                }


                player.state.choosingReward = false
                chooseRewardSubscription.unsubscribe()

                await chosenReward.onChosen(player)

            })
        }
    }
}

</script>
<template>
  <div class="container">
    <div class="row" style="height: 80vh">
      <template v-for="player of players">
        <div class="col-md-3" style="height: 100%">
          <PlayerSelect :show-health="true" :player="player" :key="`player-select-${player?.id}`">
          </PlayerSelect>
          
        </div>
       
       
      </template>
   
    </div>
    <button class="btn btn-lg btn-primary btn-block game-font" :disabled="!canContinue" @click="nextEncounter">
        CONTINUE
    </button>
  </div>
</template>

<style scoped> 
.player-select {
  float: left;
  width: 100%;
  height: 100%;
  background: #f7f7f9;
}
</style>