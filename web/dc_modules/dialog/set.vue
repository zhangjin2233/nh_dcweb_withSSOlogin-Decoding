<template>
    <div>
        <dc-dialog 
        v-for="dialog in dialogset.list" 
        :key="dialog.id" 
        :object="dialog" 
        v-if="dialog.show">
        </dc-dialog>
    </div>
</template>

<script>
import component from './set.js'
export default {
    mixins: [component]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
