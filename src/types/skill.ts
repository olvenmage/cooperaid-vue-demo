import GameSettings from '@/core/settings';
import type Character from './character';
import type { CharacterSkill, CharacterSkillTargetType } from './state/character-state';
import DamageType from './damage-type';
import type OnDamageTrigger from './triggers/on-damage-trigger';

enum TargetType {
    TARGET_ENEMY,
    TARGET_FRIENDLY,
    TARGET_NONE,
    TARGET_ANY,
    TARGET_ALL_ENEMIES
}

enum AiTargetting {
    HIGHEST_THREAT,
    RANDOM,
    MOST_HEALING,
}

export default abstract class Skill {
    abstract name: string
    abstract energyCost: number
    // cooldown in microseconds
    abstract cooldown: number
    abstract targetType: TargetType

    public imagePath: string|null = null

    // cast time in microseconds
    castTime: number = 0
    castingTimer: number = 0
    casting = false

    public onCooldownTimer = 0
    public onCooldown = false;
    public casted = false
    public aiTargetting = AiTargetting.HIGHEST_THREAT

    public interuptsOnDamageTaken = false

    public readonly castingIncrementer = 100

    private interupted = false

    currentTargets: Character[] = []

    interuptsOnDamageTakenCallback = this.onDamageTaken.bind(this)

    canCast(castBy: Character): boolean {
        if (castBy.castingSkill != null) {
            return false;
        }

        if (castBy.energyBar.current < this.energyCost) {
            return false;
        }

        if (this.onCooldown) {
            return false;
        }

        if (!castBy.actionable) {
            return false;
        }

        return true;
    }

    incrementCooldown() {
        if (this.onCooldownTimer >= this.cooldown) {
            this.onCooldownTimer = 0
            this.onCooldown = false
            return
        }

        setTimeout(() => {
            this.onCooldownTimer += 1000 * GameSettings.speedFactor
            this.incrementCooldown()
        }, 990)
    }

    incrementCastTime(castBy: Character, getTargets: () => Character[]) {
        if (castBy.dead || this.casted) {
            this.castingTimer = 0
            this.casting = false
            this.currentTargets = []
            castBy.castingSkill = null
           
            return
        }

        if (!castBy.actionable) {
            setTimeout(() => {
                this.incrementCastTime(castBy, getTargets)
            }, 200)
            return
        }

        if (this.interupted) {
            this.interupted = false;
            this.onCooldownTimer = Math.round(this.cooldown / 2)
            this.castingTimer = 0
            this.removeDamageTakenCallback(castBy)
            this.startCooldown(castBy)
            return;
        }

        this.casting = true

        if (this.castingTimer >= this.castTime) {
            this.casted = true
            this.castingTimer = 0
            this.casting = false
            this.doCast(castBy, this.currentTargets)
            this.removeDamageTakenCallback(castBy)
            this.currentTargets = []
            return
        }

        this.currentTargets = getTargets()

        setTimeout(() => {
            this.castingTimer += this.castingIncrementer * GameSettings.speedFactor
            this.incrementCastTime(castBy, getTargets)
        }, this.castingIncrementer)
    }

    areTargetsValid(targets: Character[]) {
        if (this.targetType == TargetType.TARGET_NONE) return true
        return targets.some((char) => !char.dead)
    }

    cast(castBy: Character, getTargets: () => Character[]) {
        if (!this.canCast(castBy)) {
            return false;
        }

        if (!this.areTargetsValid(getTargets())) {
            return false;
        }

        this.casted = false
        this.currentTargets = getTargets()
        this.beforeCast(castBy)
        castBy.energyBar.current -= this.energyCost

        if (this.interuptsOnDamageTaken) {
            castBy.identity.onDamageTakenTriggers.push(this.interuptsOnDamageTakenCallback)
        }

        castBy.castingSkill = this
        setTimeout(() => {
            this.incrementCastTime(castBy, getTargets)
        }, 50)
    }

    beforeCast(castBy: Character) {

    }

    doCast(castBy: Character, targets: Character[]) {
        this.castSkill(castBy, targets);

        this.startCooldown(castBy)
    }

    startCooldown(castBy: Character) {
        this.onCooldown = true
        castBy.castingSkill = null
        this.incrementCooldown()
    }

    delayCastingTime(miliseconds: number) {
        this.castingTimer = Math.min(this.castingTimer - miliseconds, 0)
    }

    removeDamageTakenCallback(character: Character) {
        const index = character.identity.onDamageTakenTriggers.findIndex((cb) => cb == this.interuptsOnDamageTakenCallback)
        
        if (index != -1) {
            character.identity.onDamageTakenTriggers.splice(index, 1)
        }
    }

    onDamageTaken(trigger: OnDamageTrigger) {
        if (trigger.actualDamage > 0 && trigger.damageType != DamageType.POISON) {
            this.interupt()
        }
    }

    interupt() {
        this.interupted = true
    }

    getCastPriority(castBy: Character, target: Character): number {
        return 0
    }

    getState(castBy: Character): CharacterSkill {
        return {
            name: this.name,
            canCast: this.canCast(castBy),
            energyCost: this.energyCost,
            validTargets: [],
            imagePath: this.imagePath,
            targetType: this.targetType as unknown as CharacterSkillTargetType
        }
    }

    abstract castSkill(castBy: Character, targets: Character[]): void
}

export { TargetType, AiTargetting }