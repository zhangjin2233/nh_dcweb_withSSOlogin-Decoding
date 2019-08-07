<template>
  <context-menu :object="contextmenu" :isChild="true" class="childMenu"/>
</template>

<script>
import component from './child.js'
export default {
    mixins: [component]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.childMenu{
  // margin-left: 6px;
  margin-top: 4px;
}
</style>
