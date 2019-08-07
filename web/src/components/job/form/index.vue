<template>
    <div class="job-form">
        <el-form :model="form" label-width="180px">
            <el-row>
                 <el-col :span="2">
                   <el-checkbox v-model="form.isAdvanced" @change="changeOn">是否启用高级配置</el-checkbox>
                </el-col>
                <el-col :span="11">
                    <el-form-item label="名称:">
                        <el-input v-model="form.name" size="mini"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="11">
                    <el-form-item label="保留历史数据（小时）:">
                        <el-input v-model="form.keepHisHours" size="mini"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
            <el-tab-pane label="定时规则" name="timeRule">
                <time-rule :data="{}" :timeRules="form.timeRules" @getTimeRule="getTimeRule" ref="timeRule"></time-rule>
            </el-tab-pane>
            <el-tab-pane label="上下文参数" name="contextParams">
                <context-params :contextData="form.flowContext"></context-params>
            </el-tab-pane>
            <!-- <el-tab-pane label="数据时间算法" name="first"></el-tab-pane> -->
        </el-tabs>
        <!-- <p class="btn-wrapper"> -->
            <!-- <el-button type="primary" @click="submit">确定</el-button> -->
            <!-- <el-button type="primary" @click="visible=false">退出</el-button> -->
        <!-- </p> -->
    </div>
</template>

<script>
import timeRule from './time-rule.vue'
import contextParams from './context-params.vue'
export default {
    name: 'jobForm',
    data () {
      return {
        timeRule: {},
        activeName: 'timeRule',
        loading: false,
      }
    },
    props: ['form'],
    components: {
        'time-rule': timeRule,
        'context-params': contextParams
    },
    created() {
        this.$nextTick(() => {
        })
    },
    methods: {
        close() {
            this.$closeDialog()
        },
        handleClick() {

        },
        getTimeRule(rule) {
            this.form.timeRules = rule
        },
        changeOn() {
            this.$emit('closeDialog')
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.btn-wrapper{
    text-align: right;
}
.el-tab-pane{
    padding: 0;
}
</style>
