import GameSettings from '@/core/settings';
import type Character from './character';
import type { CharacterSkill, CharacterSkillTargetType } from './state/character-state';
import DamageType from './damage-type';
import type OnDamageTrigger from './triggers/on-damage-trigger';
import type SkillData from './skill-data';
import type { SkillDataParams } from './skill-data';
import type SkillUpgrade from './skill-upgrade';

enum TargetType {
    TARGET_ENEMY,
    TARGET_FRIENDLY,
    TARGET_NONE,
    TARGET_SELF,
    TARGET_ANY,
    TARGET_ALL_ENEMIES
}

enum AiTargetting {
    HIGHEST_THREAT,
    RANDOM,
    MOST_HEALING,
}

export type CastSkillResponse = void | {
    triggerCooldown?: boolean
}

export default abstract class Skill {
    public abstract skillData: SkillData
    castingTimer: number = 0
    casting = false

    public onCooldownTimer = 0
    public onCooldown = false;
    public casted = false

    private interupted = false
    public socketedUpgrade: SkillUpgrade|null = null

    description: string|null = null

    currentTargets: Character[] = []
    readonly id = "skill" + Math.random().toString(16).slice(2)

    interuptsOnDamageTakenCallback = this.onDamageTaken.bind(this)

    canCast(castBy: Character): boolean {
        if (castBy.castingSkill != null) {
            return false;
        }

        if (castBy.energyBar.current < this.skillData.energyCost) {
            return false;
        }

        if (!this.skillData.canCastOnCooldown && this.onCooldown) {
            return false;
        }

        if (!castBy.actionable) {
            return false;
        }

        return true;
    }

    onCooldownFinished() {
        const onCooldownSkillData = this.onCooldownSkillData()
        
        if (onCooldownSkillData && this.skillData.isTransformed) {
            this.skillData.transformBack()
        }
    }

    onCooldownSkillData(): Partial<SkillData>|null {
        return null
    }

    incrementCooldown() {
        if (!this.onCooldown) return;

        if (this.onCooldownTimer >= this.skillData.cooldown / GameSettings.speedFactor) {
            this.finishCooldown()
            return
        }

        setTimeout(() => {
            this.onCooldownTimer += 1000
            this.incrementCooldown()
        }, 990)
    }

    finishCooldown() {
        this.onCooldownTimer = 0
        this.onCooldown = false
        this.onCooldownFinished()
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
            this.onCooldownTimer = Math.round(this.skillData.cooldown / 2)
            this.castingTimer = 0
            this.removeDamageTakenCallback(castBy)
            this.startCooldown(castBy)
            return;
        }

        this.casting = true

        if (this.castingTimer >= this.skillData.castTime) {
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
            this.castingTimer += this.skillData.castingIncrementer * (1 + (castBy.stats.speed.value / 100)) * GameSettings.speedFactor
            this.incrementCastTime(castBy, getTargets)
        }, this.skillData.castingIncrementer)
    }

    areTargetsValid(targets: Character[]) {
        if (this.skillData.targetType == TargetType.TARGET_NONE) return true
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
        castBy.energyBar.current -= this.skillData.energyCost

        if (this.skillData.interuptsOnDamageTaken) {
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
        const res = this.castSkill(castBy, targets);

        if (res?.triggerCooldown ?? true) {
            this.startCooldown(castBy)
        } else {
            castBy.castingSkill = null
        }
    }

    startCooldown(castBy: Character) {
        this.onCooldown = true
        castBy.castingSkill = null
        this.incrementCooldown()

        const onCooldownSkillData = this.onCooldownSkillData()
        
        if (onCooldownSkillData) {
            this.skillData.transform(Object.assign({}, onCooldownSkillData, { canCastOnCooldown: true }))
        }
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

    getState(castBy: Character|null): CharacterSkill {
        return {
            id: this.id,
            name: this.skillData.name,
            canCast: castBy ? this.canCast(castBy) : true,
            energyCost: this.skillData.energyCost,
            validTargets: [],
            description: this.description,
            imagePath: this.skillData.imagePath,
            targetType: this.skillData.targetType as unknown as CharacterSkillTargetType,
            cooldown: this.skillData.cooldown / GameSettings.speedFactor,
            cooldownRemaining: this.onCooldownTimer,
            buffDuration: this.skillData.buffDuration / GameSettings.speedFactor,
            castTime: this.skillData.castTime / GameSettings.speedFactor
        }
    }

    abstract castSkill(castBy: Character, targets: Character[]): CastSkillResponse
}

export { TargetType, AiTargetting }