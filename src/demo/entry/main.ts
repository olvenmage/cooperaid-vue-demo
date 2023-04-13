import Barbarian from "@/types/classes/barbarian";
import Juggernaut from "@/types/classes/juggernaut";
import Mage from "@/types/classes/mage";
import Paladin from "@/types/classes/paladin";
import Rogue from "@/types/classes/rogue";
import dragonBossSetup from "../setups/dragon-boss-setup";
import pvpSetup from "../setups/pvp";

export default function main() {
    pvpSetup(Rogue, Juggernaut)
}