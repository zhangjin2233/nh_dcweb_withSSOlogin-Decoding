<template>
    <div>
        <el-button-group v-if="object.show&&object.spaceBetween==0" :style="object.style">
            <el-button v-for="item in object.data" 
            :size="object.size"
            :type="item.type ? item.type : object.type" 
            :key="item.title ? item.title : item.text" 
            :title="item.title" 
            :class="item.icon" 
            @click="btnClick(item)"
            :style="`color:${item.color};`" :disabled="item.disabled ? item.disabled(...[params]) : false">
                <span class="btn-text" v-if="item.text">{{item.text}}</span>
            </el-button>
        </el-button-group>
        <div v-if="object.show&&object.spaceBetween!=0" :style="object.style">
            <el-button v-for="item in object.data" 
            :size="object.size"
            :type="item.type ? item.type : object.type" 
            :key="item.title ? item.title : item.text" 
            :title="item.title" 
            :class="item.icon" 
            @click="btnClick(item)"
            :style="`color:${item.color}; margin-left:${object.spaceBetween}`" :disabled="item.disabled ? item.disabled(...[object.params]) : false">
                <span class="btn-text">{{item.text}}</span>
            </el-button>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: [ 'object' ],
    data() {
      return {
          
      }
    },
    created() {},
    watch: {},
    computed: {},
    methods: {
        btnClick(item) {
            item.click(...this.object.params)
        }
    },
}
</script>
<style scoped>
.el-button{
    padding: 4px 8px;
}
</style>