<template>
  <div>
    <el-button @click="initData()" :size="toobarSize" title="刷新"><i class="fa fa-refresh" style="color:green"></i></el-button>
    <!-- <el-popover
      placement="bottom"
      width="400"
      trigger="click">
        <div>
          <div v-for="(item, index) in timeList" :key="index">{{item}}</div>
          <div>
            <el-date-picker
              v-model="reference"
              type="datetime"
              placeholder="选择日期时间">
            </el-date-picker>
          </div>
        </div>
      <i class="fa fa-clock-o" @click="showAxis"></i>
    </el-popover> -->
    <el-select v-if="type.toLowerCase() != 'historyjob'" v-model="data.hisOpTime" :size="toobarSize" style="width:160px">
      <el-option v-for="(option,optionIndex) in hisOpTimeList" :key="optionIndex" :label="option" :value="option"></el-option>
    </el-select>
    <el-select v-model="data.iCmbStatus" :size="toobarSize" style="width:80px">
      <el-option v-for="(option,optionIndex) in iCmbStatusList" :key="optionIndex" :label="option.label" :value="option.value"></el-option>
    </el-select>
    <dc-quick-multiSelect v-model="data.queueNames" :propData="{ item:{option:queueNamesList, size:toobarSize, width:120 ,allselectText:allselectText[0]} }"></dc-quick-multiSelect>
    <dc-quick-multiSelect v-model="data.cdcNames" :propData="{ item:{option:cdcNamesList, size:toobarSize, width:120 ,allselectText:allselectText[1]} }"></dc-quick-multiSelect>
    <dc-quick-multiSelect v-model="data.agents" :propData="{ item:{option:agentsList, size:toobarSize, width:120 ,allselectText:allselectText[2]} }"></dc-quick-multiSelect>
    <el-input v-model="data.keyword" @keyup.native.enter="initData()" :size="toobarSize" style="width:100px" suffix-icon="el-icon-search"></el-input>
  </div>
</template>

<script>
export default {
  name: 'toolBtn',
  props: ['data','type','toobarSize','iCmbStatusList','queueNamesList','hisOpTimeList','cdcNamesList','agentsList','allselectText'],
  data(){
    return {
      reference: ''
    }
  },
  methods:{
    initData(){
      this.$emit('refresh')
    },
    showAxis() {

    }
  }
}
</script>

<style lang="scss" scoped>

</style>


