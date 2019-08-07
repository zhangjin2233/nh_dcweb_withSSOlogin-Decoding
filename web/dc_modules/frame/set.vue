<template>
    <div class="frame-set">
        <dc-frame v-for="frame in frameset.list" :key="frame.id" :object="frame" v-show="frame.show"></dc-frame>
        <div class="frame-mini">
            <el-popover
            placement="right"
            width="260"
            trigger="hover"
            v-if="frameset.list.findIndex(f => f.show === false) !== -1">
                <ul>
                    <li v-for="frame in frameset.list" :key="frame.id" v-if="!frame.show" @click="frame.show=true">
                        <span>{{frame.title}}</span>
                        <i class="fa fa-times" title="删除窗口" @click.stop="remove(frame)"></i>
                    </li>
                </ul>
            <span slot="reference" class="fa fa-reorder btn" :style="position"></span>
            </el-popover>
        </div>
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
.frame-set{

}
ul{
    padding: 0;
    list-style: none;
    li{
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        position: relative;
        &:hover{
            color: #409eff;
            cursor: pointer;
        }
        i{
            color: red;
            position: absolute;
            right: 0;
            top: 2px;
            &:hover{
                color: red;
            }
        }
    }
}
.btn{
    position: fixed;
    border: 1px solid #ccc;
    padding: 4px;
    border-radius: 4px;
    cursor: pointer;
    &:hover{
        color: #409eff
    }
}
</style>
