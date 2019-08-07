<template>
  <el-popover class="quickMultiSelect" placement="bottom" :width="(width && Number(width)-25>150) ? Number(width)-25 : 150" trigger="click">
    <div class="selectContainer" :style="`max-height:${maxHeight || defaultHeight};`">
      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">{{allText}}</el-checkbox>
      <el-checkbox-group v-model="value0" @change="handlevalueChange">
        <el-checkbox v-for="(option,index) in options" ref="list" :label="option.value" :key="index"><span :title="tip('list',option.label,index)">{{option.label}}</span></el-checkbox>
      </el-checkbox-group>
    </div>
    <el-input slot="reference" :value="selectShow" :readonly="true" suffix-icon="el-icon-arrow-down" :size="size" :style="`width:${Number(width)}px;`"></el-input>
  </el-popover>
</template>

<script>

export default {
  name: 'quickMultiSelect',
  props: ['value', 'propData'],
  computed: {
    selectShow(){
      let options = this.propData.item.option;
      let allselectText = this.propData.item.allselectText;
      return this.value.length 
             ? (this.value.length == options.length 
                ? (allselectText || this.allText) 
                : this.tagText(this.value, options)) 
             : (!options.length 
                ? (allselectText || this.allText) 
                : "")
    },
    isIndeterminate(){
      let options = this.propData.item.option;
      return this.value.length > 0 && this.value.length < options.length
    },
    value0: { 
      get() { 
        return this.value; 
      }, 
      set(val) { 
        this.$emit('input', val); 
      } 
    }
  },
  data() {
    return {
      options: this.propData.item.option,
      size: this.propData.item.size || this.propData.form.size,
      width: this.propData.item.width || this.propData.form.quickMultiSelectWidth,
      maxHeight: this.propData.item.maxHeight,
      allText: "全选",
      checkAll: false,
      defaultHeight: '260px',
    };
  },
  methods: {
    tip(name,tip,i=''){
      // this.$refs[name] && i!=='' && (this.$refs[name+i] = this.$refs[name][i]);
      // return this.$refs[name+i] && this.$refs[name+i].offsetWidth < this.$refs[name+i].scrollWidth ? tip : '';
      return tip;
    },
    tagText(value,options){
      let option = options.find(item => item.value == value[0])
      let label = option ? option.label : "";
      return (value.length>1) ? label+"  +"+(value.length-1) : label;
    },
    handleCheckAllChange(val) {
      let options = [];
      this.options.map((item)=>{
        options.push(item.value);
      })
      val || (options=[]);
      this.value0.splice(0, this.value.length, ...options);
    },
    handlevalueChange(value) {
      this.checkAll = value.length === this.options.length;
    }
  }
}
</script>

<style lang="scss">
.selectContainer{
  $boxShadow: inset 0 0 5px rgba(0,0,0,0.2);
  overflow:auto;
  &::-webkit-scrollbar {/*滚动条整体样式*/
    width: 4px;     /*高宽分别对应横竖滚动条的尺寸*/
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
    border-radius: 5px;
    box-shadow: $boxShadow;
    background: rgba(0,0,0,0.2);
  }
  &::-webkit-scrollbar-track {/*滚动条里面轨道*/
    box-shadow: $boxShadow;
    border-radius: 0;
    background: rgba(0,0,0,0.1);
  }
  .el-checkbox{
    display: block;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    + .el-checkbox{
      margin-left: 0;
    }
  }
}
.quickMultiSelect{
  .el-input{
    display: inline-block;
    input{
      cursor: pointer; 
    }
  }
}
</style>