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
import QuickMovesSkillGem from './rogue/quick-moves-skill-gem'
import ShadowSurge from './rogue/shadow-surge'
import HammerOfRestorationSkillGem from './paladin/hammer-of-restoration'
import HammerOfRetributionSkillGem from './paladin/hammer-of-retribution'
import HammerOfVengeanceSkillGem from './paladin/hammer-of-vengeance'
import ToxicBombsSkillGem from './rogue/toxic-bombs-skill-gem'
import BloodBerserkSkillGem from './barbarian/blood-berserk'
import RagingBlowSkillGem from './barbarian/bloodthirsty-rampage copy'
import DeepSleepSkillGem from './druid/deep-sleep-skill-gem'
import GuardingScalesSkillGem from './druid/guarding-scales-skill-gem'
import WingManSkillGem from './juggernaut/wing-man-skill-gem'
import ForcefulShieldShatterSkillGem from './juggernaut/forceful-shield-shatter'

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
    new WingManSkillGem(),
    new ForcefulShieldShatterSkillGem(),

    // Rogue
    new ExposingDartSkillGem(),
    new KnifeStormSkillGem(),
    new NullifyingDismantleSkillGem(),
    new ParalyzingDartSkillGem(),
    new QuickMovesSkillGem(),
    new ShadowSurge(),
    new ToxicBombsSkillGem(),

    // Paladin
    new OverwhelmingMartyrdom(),
    new RejuvenatingLight(),
    new FinishingStrikeSkilGem(),
    new BrandingSmiteSkillGem(),
    new HammerOfRestorationSkillGem(),
    new HammerOfRetributionSkillGem(),
    new HammerOfVengeanceSkillGem(),

    // Druid
    new HealthyCommandNatureSkillGem(),
    new DegrowthSkillGem(),
    new DeepSleepSkillGem(),
    new GuardingScalesSkillGem(),

    // Barbarian
    new BloodthirstyRampage(),
    new AngryYellingSkillGem(),
    new BloodBerserkSkillGem(),
    new RagingBlowSkillGem()
]

export default abstract class GemLootProvider {
    static getUpgradeGemOptions(player: Player, amount = 3): UpgradeGem<any>[] {
        const loot: UpgradeGem<Skill>[] = [];

       for (let i = 0; i < amount; i++) {
        for (const skill of shuffleArray(player.allSkills)) {

            // Only get a gem that can be applied to a skill and include no duplicates
            const upgradeGemThatApplies = shuffleArray(GEMS).find((gem) => {
                return gem.applies(skill) && gem.name != skill.socketedUpgrade?.name && !loot.some((lootGem) => lootGem.name == gem.name) && !player.inventory.skillGems.some((invGem) => invGem.name == gem.name)
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