<template>
    <el-dialog
    :title="object.title"
    :width="object.width"
    :visible.sync="object.show"
    :fullscreen="object.fullscreen"
    :top="object.top"
    :showClose="object.showClose"
    :modal="object.modal"
    :center="object.center"
    :custom-class="object.verticalCenter ? 'centered-dialog' : object.class"
    @close="close">
        <div v-html="object.appendTop" v-if="object.appendTop"></div>
        <component :is="object.component" :propData="object.data" ref="component"></component>
        <div v-html="object.appendBottom" v-if="object.appendBottom"></div>
        <p :style="`text-align:${object.btnAlign}`" v-if="object.hasBtn && object.btnGroup.length > 0">
            <el-button v-for="btn in object.btnGroup" :key="btn.text" @click="btnClick(btn)" :type="btn.type" :size="btn.size">{{btn.text}}</el-button>
        </p>
    </el-dialog>
</template>

<script>
import component from './index.js'
export default {
    mixins: [component]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.el-dialog__body>p{
    margin-bottom: 0;
}
</style>
