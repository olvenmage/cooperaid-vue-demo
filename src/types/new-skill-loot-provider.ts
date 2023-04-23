import shuffleArray from '@/utils/shuffleArray'
import type Player from './player'
import type { CharacterSkill } from '@/client-socket/types/character-state'
import type Skill from './skill';

export default abstract class NewSkillLootProvider {
    static getNewSkillOptions(player: Player, amount = 3): Skill[] {
        const loot: Skill[] = [];

        for (const skill of shuffleArray(player.playerClass!.possibleSkills)) {
            // no duplicate skills
            if (player.allSkills.findIndex((sk) => sk.skillData.name == skill.skillData.name) !== -1) {
                continue
            }

            loot.push(skill)

            if (loot.length >= amount) {
                break;
            }
        }

       return loot
    }
}