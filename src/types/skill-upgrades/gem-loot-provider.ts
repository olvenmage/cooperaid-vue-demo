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
import DurableShieldBlockSkillGem from './juggernaut/durable-shield-block-skill-gem'
import ExposingDartSkillGem from './rogue/exposing-dart-skill-gem'
import KnifeStormSkillGem from './rogue/knife-storm-skill-gem'
import NullifyingDismantleSkillGem from './rogue/nullifying-dismantle-skill-gem'
import ParalyzingDartSkillGem from './rogue/paralyzing-dart-skill-gem'
import MegaFortificationSkillGem from './juggernaut/mega-fortification'
import HealthyCommandNatureSkillGem from './druid/healthy-command-skill-gem'
import OverwhelmingMartyrdom from './paladin/overwhelming-martyrdom'
import RejuvenatingLight from './paladin/rejuvenating-light'
import BloodthirstyRampage from './barbarian/bloodthirsty-rampage'
import DegrowthSkillGem from './druid/degrowth-skill-gem'
import FinishingStrikeSkilGem from './paladin/finishing-strike'
import BrandingSmiteSkillGem from './paladin/branding-smite'
import EnergyCostSkillGem from './generic/energy-cost-reduction-skill-gem'
import AngryYellingSkillGem from './barbarian/angry-yelling'

const GEMS = [

    // Generic
    new BuffDurationSkillGem(),
    new CastTimeReductionSkillGem(),
    new CooldownReductionSkillGem(),
    new DamageIncreaseSkillGem(),
    new HealingIncreaseSkillGem(),
    new EnergyCostSkillGem(),

    // Juggernaut
    new ShieldBlockAlliesSkillGem(),
    new DurableShieldBlockSkillGem(),
    new MegaFortificationSkillGem(),

    // Rogue
    new ExposingDartSkillGem(),
    new KnifeStormSkillGem(),
    new NullifyingDismantleSkillGem(),
    new ParalyzingDartSkillGem(),

    // Paladin
    new OverwhelmingMartyrdom(),
    new RejuvenatingLight(),
    new FinishingStrikeSkilGem(),
    new BrandingSmiteSkillGem(),

    // Druid
    new HealthyCommandNatureSkillGem(),
    new DegrowthSkillGem(),

    // Barbarian
    new BloodthirstyRampage(),
    new AngryYellingSkillGem(),
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