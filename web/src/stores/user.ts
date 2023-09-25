import { ref } from 'vue'
import { defineStore } from 'pinia'

export const userStore = defineStore('user', () => {
  const user = ref(null)

  return {
    user,
  }
})
