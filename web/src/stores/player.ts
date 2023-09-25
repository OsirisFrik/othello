import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { PlayerData } from '@/libs/multiplayer'
import randomStr from '@/libs/generator'

export const PlayerStore = defineStore('player', () => {
  const player = useStorage<PlayerData>('player', {
    id: randomStr(8),
    nickname: randomStr(8),
    isOwner: false,
  })

  function setPlayer(data: PlayerData) {
    player.value = data
  }

  return {
    player,
    setPlayer
  }
})
