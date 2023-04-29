import type { CharacterSkill } from "@/client-socket/types/character-state";
import type Player from "../player";
import GemLootProvider from "../skill-upgrades/gem-loot-provider";
import Reward from "./reward";
import NewSkillLootProvider from "../new-skill-loot-provider";
import { pubSetWaitingState, pubUpdatePickSkillState } from "@/client-socket/OutgoingMessages";
import Game from "@/core/game";
import type Skill from "../skill";
import { subChooseNewSkill } from "@/client-socket/IncomingMessages";

export default class SkillReward extends Reward {
    name: string = "Skill"
    description = "Choose a new skill to learn"
    imagePath = "/rewards/new-skill-reward.png"
    
    onChosen(player: Player): Promise<void> {
        const newSkills = NewSkillLootProvider.getNewSkillOptions(player, 3) as Skill[]
        let hasPickedSkill = false;

        return new Promise((resolve, reject) => {
            Game.webSocket.publish(pubUpdatePickSkillState({
                playerId: player.id,
                state: newSkills.map((sk) => sk.getState(player.combatCharacter, null))
            }))

            const updateSkillsInterval = setInterval(() => {
                if (hasPickedSkill) return;
                Game.webSocket.publish(pubUpdatePickSkillState({
                    playerId: player.id,
                    state: newSkills.map((sk) => sk.getState(player.combatCharacter, null))
                }))
            }, 2000)
           

            const chooseSkillSubscription = Game.webSocket.subscribe(subChooseNewSkill , (event) => {
                if (event.body.playerId != player.id) return

                const chosenSkill = newSkills.find((sk) => sk.id == event.body.skillId)
                if (!chosenSkill || hasPickedSkill) {
                    return;
                }
                hasPickedSkill = true;
                chosenSkill.id = "skill" + Math.random().toString(16).slice(2)

                chooseSkillSubscription.unsubscribe()
                player.skills.push(chosenSkill)
                player.state.choosingReward.stopChoosingReward()
                clearInterval(updateSkillsInterval)
               
                Game.webSocket.publish(pubSetWaitingState({
                    playerId: player.id,
                    state: player.getWaitState()
                }))

                resolve()
            })  
        })
    }
}