<template>
  <div class="popover">
      <el-popover
        :placement="object.placement"
        :value="object.visiable"
        :title="object.title"
        :width="object.width"
        :trigger="object.trigger"
        :content="object.content"
        :offset="object.offset"
        :open-delay="object.delay"
        @show="show"
        @hide="hide"
        :disabled="object.disabled">
        <slot name="content" :data="object.data" v-if="!object.content">       
        </slot>
        <component :is="object.component" v-if="object.component&&!object.content" :propData="object.data"></component>
        <template slot="reference">
          <slot name="trigger"></slot>
        </template>
      </el-popover>
  </div>
</template>

<script>
import component from './index.js'
export default {
    mixins: [component]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
