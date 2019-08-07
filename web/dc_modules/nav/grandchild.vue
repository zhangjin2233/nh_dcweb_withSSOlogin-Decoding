<template>
    <child-menu :data="data" :nav="nav" class="grand-child-menu" :style="`left: ${nav.menuWidth+8}px`"></child-menu>
</template>

<script>
import component from './grandChild.js'
export default {
    mixins: [component]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.grand-child-menu{
    width: 120px;
    position: absolute;
    top: 4px;
}
</style>
