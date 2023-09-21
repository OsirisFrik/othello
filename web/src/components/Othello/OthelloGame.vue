<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import randomStr from '@/libs/generator'
import { CellValue } from '@/libs/enum'
import Othello, { type Movement } from '@/libs/game/Othello'

const router = useRouter()
const route = useRoute()
const room = route.query.room ?? randomStr(8)
const _game = new Othello(room as string)
const game = ref(_game)


onBeforeMount(() => {
  if (!route.query.room) {
    router.replace({ query: { room: room } })
  }
})

onMounted(() => {

})

function makeMove([x, y]: Movement) {
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
            'cell-empty': cell === CellValue.EMPTY,
            'cell-white': cell === CellValue.WHITE,
            'cell-black': cell === CellValue.BLACK,
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
