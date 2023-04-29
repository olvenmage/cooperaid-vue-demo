import Game from "@/core/game";
import type Player from "./player";
import { pubSetWaitingState, pubUpdateGemSocketingState, pubUpdatePickRewardState } from "@/client-socket/OutgoingMessages";
import { subChooseReward, subSocketGemIntoSkill, subStartSocketing, subStopSocketing } from "@/client-socket/IncomingMessages";
import type { AppSocketSubscription } from "@/app-socket/lib/core/types";
import SkillReward from "./reward/skill-reward";
import HealingReward from "./reward/healing-reward";
import GemReward from "./reward/gem-reward";
import type Reward from "./reward/reward";

export default class PlayerChoosingReward {
    active = false

    chooseRewardSubscription: AppSocketSubscription|null = null

    rewards: Reward[] = []

    constructor(private player: Player) {

    }

    publishRewardState() {
        if (!this.active) {
            return
        }

        const rewards = [];

        if (this.player.healthBar.current <= 0) {
             
        } else {
            rewards.push(new HealingReward(), new GemReward())

            if (this.player.skills.length < 4) {
                rewards.push(new SkillReward())
            }
        }

        this.rewards = rewards

        Game.webSocket.publish(pubUpdatePickRewardState({
            playerId: this.player.id,
            state: rewards.map((r) => r.getState())
        }))
    }

    startListening(): this {
        return this
    }

    startChoosingReward() {
        this.active = true;

        this.chooseRewardSubscription = Game.webSocket.subscribe(subChooseReward, async (event) => {
            if (event.body.playerId != this.player.id) return

            const chosenReward = this.rewards.find((reward) => reward.name == event.body.rewardName)

            if (!chosenReward || !this.player.state.choosingReward) {
              return
            }


            this.active = false;
            this.chooseRewardSubscription?.unsubscribe()

            await chosenReward.onChosen(this.player)
        })
    }

    stopChoosingReward() {
        this.chooseRewardSubscription?.unsubscribe()
        this.chooseRewardSubscription = null

        if (this.active) {
            Game.webSocket.publish(pubSetWaitingState({
                playerId: this.player.id,
                state: this.player.getWaitState()
            }))
        }

        this.active = false;
    }
}