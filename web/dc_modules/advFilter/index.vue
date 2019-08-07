<template>
  <div class="filter-search">
    <!-- 工具栏按钮组 -->
    <el-button-group>
      <el-button v-for="(btn,i) in advFilter.toolbar" :key="i" @click="toolBtnClick(btn)" :title="btn.title" :disabled="btn.disabled && btn.disabled(advFilter)">
        <i :class="btn.icon" :style="btn.style">{{btn.label}}</i>
      </el-button>
    </el-button-group>

    <!-- 内容显示区 -->
    <div class="body">
      <el-tree ref="filterTree"
        :data="advFilter.treeData" node-key="id" :empty-text="advFilter.emptyText" :default-expanded-keys="advFilter.expandKeys"
        :accordion="advFilter.accordion" :highlight-current="advFilter.hightLightCurrent" @node-click="handleNodeClick">
      </el-tree>
    </div>

    <!-- 编辑区 -->
    <div class="select">
      <el-select v-if="advFilter.showType('type1', advFilter.currentNode.flag)" v-model="advFilter.currentNode.label" :placeholder="advFilter.type1.placeholder" >
        <el-option v-for="(option, optionIndex) in advFilter.type1.option" :key="optionIndex" :value="option.value" :label="option.label"></el-option>
      </el-select>
      <div v-else-if="advFilter.type=='mainJob' && advFilter.showType('type3', advFilter.currentNode.flag)">
        <!-- 可输入的下拉 -->
        <el-select v-model="advFilter.currentNode.name" filterable allow-create @change="advFilter.getNodeLabel(advFilter.currentNode)">
          <el-option v-for="(option,optionIndex) in advFilter.option_leftV" :key="optionIndex" :label="option.label" :value="option.value"></el-option>
        </el-select>
        <!-- 中间的单选下拉 -->
        <el-select v-model="advFilter.currentNode.flag" @change="advFilter.getNodeLabel(advFilter.currentNode)" style="width:100px">
          <el-option v-for="(option, optionIndex) in advFilter.option_op" :key="optionIndex" :value="option.value" :label="option.label"></el-option>
        </el-select>
        <!-- 可输入的下拉 -->
        <el-select v-model="advFilter.currentNode.value" @change="advFilter.getNodeLabel(advFilter.currentNode)">
          <el-option v-for="(option, optionIndex) in advFilter.option_rightV" :key="optionIndex" :value="option.value" :label="option.label"></el-option>
        </el-select>
      </div>
      <div v-else-if="advFilter.showType('type2', advFilter.currentNode.flag)">
        <el-select v-model="advFilter.currentNode.name" :placeholder="advFilter.attr.placeholder" @change="advFilter.getNodeLabel(advFilter.currentNode)">
          <el-option v-for="(option,optionIndex) in advFilter.attr.option" :key="optionIndex" :label="option.label" :value="option.value"></el-option>
        </el-select>
        <el-select v-model="advFilter.currentNode.flag" :placeholder="advFilter.type2.placeholder" @change="advFilter.getNodeLabel(advFilter.currentNode)">
          <el-option v-for="(option, optionIndex) in advFilter.type2.option" :key="optionIndex" :value="option.value" :label="option.label"></el-option>
        </el-select>
        <el-input v-model="advFilter.currentNode.value" style="width:auto" @change="advFilter.getNodeLabel(advFilter.currentNode)"></el-input>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'advFilter',
  props: ['object','propData'],
  data () {
    return {
      advFilter: this.propData ? this.propData.object : this.object,
    }
  },
  watch:{
    object(){
      this.advFilter = this.object;
    },
    propData(){
      this.advFilter = this.propData.object;
    }
  },
  created() {
    this.$nextTick(()=>{
      this.advFilter.initAll(this);
    });
  },
  methods: {
    toolBtnClick(btn){
      btn.click.call(this,this.advFilter,btn);
    },
    handleNodeClick(data) {
      this.advFilter.handleNodeClick(data);
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.body{
  width: 100%;
  height: 200px;
  overflow: auto;
  background: #fff;
  border: 1px solid #ccc;
  margin: 10px 0;
}
</style>
