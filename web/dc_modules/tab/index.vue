<template>
    <el-tabs :style="`height: ${object.height}; width: ${object.width}`" 
    v-model="object.currentTab" 
    :type="object.type" 
    :tab-position="object.tabPosition" 
    @tab-remove="remove" 
    @tab-click="tabClick"
    v-if="object.tabs.length"
    :class="{fullscreen: object.isFullscreen}">
        <el-tab-pane
        :key="item.id"
        v-for="item in object.tabs"
        :label="item.title"
        :name="item.id"
        :closable="item.closable">
            <keep-alive>
                <component :is="item.component" :propData="item.data" :ref="item.id"></component>
            </keep-alive>
        </el-tab-pane>
    </el-tabs> 
</template>

<script>
import component from './index.js'
export default {
    mixins: [component]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.fullscreen{
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 800;
}
</style>
