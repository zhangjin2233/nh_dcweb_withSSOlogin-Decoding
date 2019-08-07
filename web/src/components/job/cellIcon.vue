<template>
  <i v-if="data.row[data.name]" :class="icons[0].icon" :style="`color:${icons[0].color}`"></i>
  <i v-else :class="icons[1].icon" :style="`color:${icons[1].color}`"></i>
</template>

<script>

export default {
  name: 'cellIcon',
  props: ['data'],
  data () {
    return {
      icons: [{
        icon: 'fa fa-stop',
        color: 'red',
      },{
        icon: 'fa fa-power-off',
        color: '#ff8936',
      }]
    }
  },
}
</script>

