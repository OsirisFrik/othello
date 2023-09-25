<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import randomStr from '@/libs/generator'
import { Othello, Chips, type OthelloMovement } from '@/libs/game/Othello'
import { Player } from '@/libs/multiplayer'
import { PlayerStore } from '@/stores/player'

const playerStore = PlayerStore()
const router = useRouter()
const route = useRoute()
const room = route.query.room ?? randomStr(8)
const player = new Player(playerStore.player)
const _game = Othello.createNewGame(room as string, true, player)
const game = ref(_game)

// @ts-expect-error
window.$game = _game


onBeforeMount(() => {
  if (!route.query.room) {
    router.replace({ query: { room: room } })
  }
})

onMounted(() => {

})

function makeMove([x, y]: OthelloMovement) {
  _game.makeMove([x, y])
}
</script>

<style>
table>tr>td {
  width: 60px;
  height: 60px;
  text-align: center;
  border-color: gray;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
}

.cell-white {
  background-color: white;
  color: black;
}

.cell-black {
  background-color: black;
}

.cell-empty {
  background-color: transparent;
}

.can-place-piece {
  border-color: red;
}
</style>

<template>
  <div>
    <table id="board">
      <tr v-for="(row, x) in game.board" :key="x">
        <td
          v-for="(cell, y) in row"
          :key="y"
          :class="{
            'cell-empty': cell === Chips.EMPTY,
            'cell-white': cell === Chips.WHITE,
            'cell-black': cell === Chips.BLACK,
            'can-place-piece': _game.validateMove([x, y])
          }"
          @click="makeMove([x, y])"
        >
          {{ x }}, {{ y }}, {{ cell }} {{  _game.validateMove([x, y])  }}
        </td>
      </tr>
    </table>
  </div>
</template>
