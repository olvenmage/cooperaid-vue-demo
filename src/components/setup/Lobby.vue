<script setup lang="ts">
import { nextTick, computed, onMounted, reactive, watch } from 'vue';
import { TargetType } from '@/types/skill';
import Game from '@/core/game';
import Barbarian from '@/types/classes/barbarian';
import Rogue from '@/types/classes/rogue';
import Juggernaut from '@/types/classes/juggernaut';
import Mage from '@/types/classes/mage';
import Paladin from '@/types/classes/paladin';
import presenterSocket from '@/client-socket/presenter-socket';
import { playerJoinMessage } from '@/client-socket/IncomingMessages';
import type Identity from '@/types/identity';
import type IdentityState from '@/types/state/identity-state';
import type LobbyState from '@/types/state/lobby-state';
import { pubUpdateLobbyState } from '@/client-socket/OutgoingMessages';
import { subChangePlayerClass } from '@/client-socket/IncomingMessages';
import type PlayerIdentity from '@/types/player-identity';
import PlayerSelect from './PlayerSelect.vue';
import type Player from '@/types/player';
import { CombatEncounter } from '@/core/encounter';
import Enemy from '@/types/enemy';
import DragonBoss from '@/types/enemies/dragon-boss';
import GameSettings from '@/core/settings';
import Druid from '@/types/classes/druid';
import DragonEgg from '@/types/enemies/dragon-egg';

const players = Game.players.value

const classes = [
  new Barbarian(),
  new Rogue(),
  new Juggernaut(),
  new Paladin(),
  new Mage(),
  new Druid()
]

const playerAssignment: Record<number, Player|null> = reactive({
  0: null,
  // 1: null,
  // 2: null,
  // 3: null
})

const availableClasses = computed<PlayerIdentity[]>(() => {
  return classes.filter((c) => players.findIndex((plr) => plr.playerClass?.name == c.name) === -1)
})

const availableClassStates = computed(() => {
  return availableClasses.value.map((cls) => cls.getState())
})

watch(players, () => {
  for (const index in players) {
    playerAssignment[index] = players[index] as Player
  }
})


const playerAmount = computed(() => Object.keys(playerAssignment).length)


function setClass(playerId: string, playerClassName: string) {
      const player = players.find((plr) => plr.id == playerId)
      const playerClass = availableClasses.value.find((cls) => cls.name == playerClassName)

      if (player && playerClass) {
          player.playerClass = playerClass
      }
}

function start() {
  Game.startGame({
    players: Game.players.value as Player[],
    route: [
      new CombatEncounter(
        [
        // new Enemy(new DragonEgg()),
        // new Enemy(new DragonBoss()),
        // new Enemy(new DragonEgg()),
        new Enemy(new Druid())
        ]
      )
    ]
  })
}

onMounted(() => {
  presenterSocket.subscribe(subChangePlayerClass , (event) => {
    setClass(event.body.playerId, event.body.playerClass)
  })

  setInterval(() => {
    const state: LobbyState = {
      availableClasses: availableClassStates.value,
      players: players.map((plr) => plr.getState())
    }

    players.forEach((plr) => {
      const avClasses = [...state.availableClasses]

      if (plr.playerClass) {
        avClasses.push(plr.playerClass.getState())
      }

      presenterSocket.publish(pubUpdateLobbyState({
        playerId: plr.id,
        state: {
          availableClasses: avClasses,
          players: state.players,
        }
      }))
    })
  }, 500)
})

</script>
<template>
  <div class="container">
    <div class="row" style="height: 80vh">
      <template v-for="player of playerAssignment">
        <div class="col-md-3" style="height: 100%">
          <PlayerSelect :player="player" :key="`player-select-${player?.id}`">
            <template #default="{ player }">
              <select v-if="player && !player.controledExternally" v-model="player.playerClass" class="form-control">
                <option  :value="player.playerClass" v-if="player.playerClass" :style="{color: player.playerClass?.color}">
                  {{ player.playerClass.name }}
                </option>
                <option v-for="playerClass in availableClasses" :value="playerClass" :style="{color: playerClass.color}">
                    {{ playerClass.name }}
                </option>
              </select>
              <input class="form-control" v-else-if="player" type="text" :value="player.playerClass?.name" disabled>
            </template>
          </PlayerSelect>
          
        </div>
       
       
      </template>
   
    </div>
    <button class="btn btn-lg btn-primary btn-block game-font" :disabled="players.length != playerAmount" @click="start">
        START GAME
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