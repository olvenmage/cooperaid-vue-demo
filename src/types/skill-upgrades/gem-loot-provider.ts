import shuffleArray from '@/utils/shuffleArray'
import type Player from '../player'
import pickRandom from '@/utils/pickRandom'
import type UpgradeGem from '../upgrade'
import type Skill from '../skill'
import BuffDurationSkillGem from './generic/buff-duration-skill-gem'
import CastTimeReductionSkillGem from './generic/cast-time-reduction-skill-gem'
import CooldownReductionSkillGem from './generic/cooldown-reduction-skill-gem'
import DamageIncreaseSkillGem from './generic/damage-increase-skill-gem'
import HealingIncreaseSkillGem from './generic/healing-increase-skill-gem'
import ShieldBlockAlliesSkillGem from './juggernaut/shield-block-allies-skill-gem'

const GEMS = [
    new BuffDurationSkillGem(),
    new CastTimeReductionSkillGem(),
    new CooldownReductionSkillGem(),
    new DamageIncreaseSkillGem(),
    new HealingIncreaseSkillGem(),
    new ShieldBlockAlliesSkillGem()
]

export default abstract class GemLootProvider {
    static getUpgradeGemOptions(player: Player, amount = 3): UpgradeGem<any>[] {
        const loot: UpgradeGem<Skill>[] = [];

       for (let i = 0; i < amount; i++) {
        for (const skill of shuffleArray(player.allSkills)) {

            // Only get a gem that can be applied to a skill and include no duplicates
            const upgradeGemThatApplies = shuffleArray(GEMS).find((gem) => {
                return gem.applies(skill) && gem.name != skill.socketedUpgrade?.name && !loot.some((lootGem) => lootGem.name == gem.name)
            })

            if (upgradeGemThatApplies) {
                loot.push(upgradeGemThatApplies)
                break;
            }
        }
       }

       return loot
    }
}