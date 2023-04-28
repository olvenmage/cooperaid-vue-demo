import Game from "@/core/game";
import type Player from "./player";
import { pubSetWaitingState, pubUpdateGemSocketingState } from "@/client-socket/OutgoingMessages";
import { subSocketGemIntoSkill, subStartSocketing, subStopSocketing } from "@/client-socket/IncomingMessages";
import type { AppSocketSubscription } from "@/app-socket/lib/core/types";

export default class PlayerSocketing {
    active = false

    socketIntoSkillSubscription: AppSocketSubscription|null = null

    constructor(private player: Player) {

    }


    publishSocketingState() {
        if (!this.active) {
            return
        }
        const allSkills = [
            this.player.basicSkill!,
            ...this.player.skills
        ]

        Game.webSocket.publish(pubUpdateGemSocketingState({
            playerId: this.player.id,
            state: {
                skills: allSkills?.map((skill) => skill.getState(this.player.combatCharacter, null)) ?? [],
                inventory: this.player.inventory.getState(this.player)
            }
        }))
    }

    startListening(): this {
        Game.webSocket.subscribe(subStartSocketing, (event) => {
            if (event.body.playerId != this.player.id) return

            this.startSocketing()

            const stopSubscription = Game.webSocket.subscribe(subStopSocketing, (event) => {
                if (event.body.playerId != this.player.id) return
                stopSubscription.unsubscribe()
                this.stopSocketing()
            })
        })

        return this
    }

    startSocketing() {
        this.active = true;

        this.socketIntoSkillSubscription = Game.webSocket.subscribe(subSocketGemIntoSkill, (event) => {
            if (event.body.playerId != this.player.id || !this.active) return

            const skill = this.player.allSkills.find((sk) => sk.id == event.body.skillId)

            if (!skill) {
                return
            }

            const gemIndex = this.player.inventory.skillGems.findIndex((gem) => gem.id == event.body.gemId)

            if (gemIndex == -1) {
                return
            }

            const gem = this.player.inventory.skillGems[gemIndex]

            if (!gem.applies(skill)) {
                return
            }

            if (skill.socketedUpgrade) {
                this.player.inventory.addGem(skill.socketedUpgrade)
            }

            skill.socketedUpgrade = gem
            this.player.inventory.skillGems.splice(gemIndex, 1)
        })
    }

    stopSocketing() {
        this.socketIntoSkillSubscription?.unsubscribe()
        this.socketIntoSkillSubscription = null

        if (this.active) {
            Game.webSocket.publish(pubSetWaitingState({
                playerId: this.player.id,
                state: this.player.getWaitState()
            }))
        }

        this.active = false;
    }
}