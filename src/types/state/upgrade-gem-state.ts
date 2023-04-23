export default interface UpgradeGemState {
    id: string
    name: string
    description: string
    imagePath: string|null
    appliesTo: string[]
}
