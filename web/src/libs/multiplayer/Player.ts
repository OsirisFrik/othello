
export interface PlayerData<G = any> {
  id: string
  nickname?: string
  isOwner: boolean
  gameState?: G
}

export class Player<G = any> implements PlayerData<G> {
  id: string
  nickname?: string | undefined
  isOwner: boolean
  gameState?: G

  constructor(data: PlayerData<G>) {
    this.id = data.id
    this.nickname = data.nickname
    this.isOwner = data.isOwner
    this.gameState = data.gameState
  }
}
