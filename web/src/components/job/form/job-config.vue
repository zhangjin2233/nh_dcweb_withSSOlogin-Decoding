<template>
    <div class="job-config"
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-form ref="form" :model="form" label-width="140px" v-show="!form.isAdvanced">
            <el-form-item label="名称">
                <el-input v-model="form.name" style="width: 260px;"></el-input>
            </el-form-item>
            <el-form-item label="开始时间">
                <el-date-picker
                v-model="form.startTime"
                :disabled="propData.type === 'edit'"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="选择日期时间">
                </el-date-picker>
            </el-form-item>
             <el-form-item label="结束时间">
                <el-date-picker
                v-model="form.endTime"
                :picker-options="endTimeOptions"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="选择日期时间">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="更新频率">
                <el-input v-model="form.frequency.value" style="width: 80px;" type="number"></el-input>
                <el-select v-model="form.frequency.key" style="width: 80px;">
                    <el-option v-for="(label, key) in timeTypeOptions" :key="key" :label="label" :value="key"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="单位周期启动时间点">
               <el-date-picker v-if="form.frequency.key === 'Year'"
                v-model="cycleTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="任意时间点">
                </el-date-picker>
                <span v-if="form.frequency.key === 'Month'">
                    <el-select v-model="form.timePoint.Day" style="width: 120px;">
                        <el-option v-for="item in dates" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <el-time-picker
                    style="width: 180px;"
                    v-model="time"
                    value-format="HH:mm:ss"
                    placeholder="任意时间点">
                    </el-time-picker>
                </span>  
                <span v-if="form.frequency.key === 'DayOfWeek'">
                    <el-select v-model="form.timePoint.DayOfWeek" style="width: 100px;">
                        <el-option v-for="item in weeks" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                    <el-time-picker
                    style="width: 140px;"
                    v-model="time"
                    value-format="HH:mm:ss"
                    placeholder="任意时间点">
                    </el-time-picker>
                </span>
                <el-time-picker v-if="form.frequency.key === 'Day'"
                v-model="time"
                value-format="HH:mm:ss"
                placeholder="任意时间点">
                </el-time-picker>
                <span v-if="form.frequency.key === 'Hour'">
                    <el-select v-model="form.timePoint.Min" style="width: 80px;">
                        <el-option v-for="item in mins" :label="item" :key="item" :value="item"></el-option>
                    </el-select>
                    <span>分</span>
                    <el-select v-model="form.timePoint.Second" style="width: 80px;">
                        <el-option v-for="item in seconds" :label="item" :key="item" :value="item"></el-option>
                    </el-select>
                    <span>秒</span>
                </span>
                <span  v-if="form.frequency.key === 'Min'">
                    <el-select v-model="form.timePoint.Second" style="width: 80px;margin-right: 14px">
                        <el-option v-for="item in seconds" :label="item" :key="item" :value="item"></el-option>
                    </el-select>秒
                </span>
              
                     
            </el-form-item>
        </el-form>
        <el-checkbox v-model="form.isAdvanced" @change="changeOn">是否启用高级配置</el-checkbox>
        <p class="btn-group">
            <el-button type="primary" @click="submit">保存</el-button>
            <el-button @click="$closeDialog">取消</el-button>
        </p>
        <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        top="2vh"
        width="800px"
        @close="dialogClose"
        :append-to-body="true">
            <job-form :form="form" :visible.sync="dialogVisible" @closeDialog="dialogVisible=false"></job-form>
            <p class="bottom-btn">
                <el-button type="primary" @click="submit" v-if="form.isAdvanced">确定</el-button>
                <el-button @click="dialogVisible=false">取消</el-button>
            </p>
        </el-dialog>
    </div>
</template>

<script>
import jobForm from './index.vue'
export default {
    name: 'jobConfig',
    data () {
        return {
            form: {
                name: 'new Job',
                startTime: '',
                endTime: '',
                keepHisHours: '24',
                frequency: {
                    value: 1,
                    key: 'Year'
                },
                timePoint: {
                    Year: '',
                    Month: '',
                    Day: '31',
                    Hour: '',
                    Min: '',
                    Second: '',
                    DayOfWeek: 1
                },
                on: false,
                flowContext: {
                    tableData: [],
                    tableHead: []
                },
                timeRules: {
                },
            },
            timeTypeOptions: {
                Year: '年',
                Month: '月',
                DayOfWeek: '周',
                Day: '日',
                Hour: '小时',
                Min: '分'
            },
            cycleTime: '',
            dates: [],
            weeks: [],
            mins: [],
            seconds: [],
            time: '',
            min: '00',
            second: '00',
            date: new Date().getDate(),
            week: new Date().getDay() + 1,
            isSuperConfig: false,
            dialogVisible: false,
            endTimeOptions: {
                disabledDate: (date) => {
                    if(new Date(date).getTime() < new Date(this.form.startTime)) {
                        return true
                    }else{
                        return false
                    }
                }
            },
            loading: false,
            frequencyKeys: {
                Year: ['Year', 'Month', 'Day', 'Hour', 'Min', 'Second'],
                Month: ['Day', 'Hour', 'Min', 'Second'],
                DayOfWeek: ['DayOfWeek', 'Hour', 'Min', 'Second'],
                Day: ['Hour', 'Min', 'Second'],
                Hour: ['Min', 'Second'],
                Min: ['Second']
            }
        }
    },
    props: ['propData'],
    created() {
        this.dates = this.getDates()
        this.weeks = this.getWeeks()
        this.mins = this.getMins()
        this.seconds = this.getMins()
        this.form.startTime = this.getNowTime()
        if(this.propData.type === 'edit') {
            this.getData()
        }else {
            this.cycleTime = this.getNowTime()
        }
    },
    components: {'job-form': jobForm},
    methods: {
        getData() {
            this.loading = true
            DCHttp.req({
                url: '/api/Job/detail',
                params: {
                    id: this.propData.jobId,
                    type: this.propData.catalogType
                }
            }).then(res => {
                this.loading = false
                this.form = res
                this.dialogVisible = this.form.isAdvanced
                this.form.timePoint || (this.form.timePoint = {
                    Year: new Date().getFullYear(),
                    Month: '',
                    Day: '31',
                    Hour: '',
                    Min: '',
                    Second: '',
                    DayOfWeek: 1 }) 
                this.form.frequency || (this.form.frequency = {key: 'Year', value: 1})
                this.form.timeRules || (this.form.timeRules = {})
                if(this.form.frequency.key === 'Year') {
                    if(this.form.timePoint) {
                        this.cycleTime = this.getTime(this.form.timePoint, 'date')
                    }
                    this.time = '00:00:00'
                }else if(this.form.frequency.key === 'DayOfWeek' || this.form.frequency.key === 'Month' || this.form.frequency.key === 'Day') {
                    // this.cycleTime = this.form.startTime
                    if(this.form.timePoint) {
                        this.time = this.getTime(this.form.timePoint, 'time')
                    }
                }
            })
        },
        getNowTime() {
            let now = new Date()
            return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
        },
        getTimeType() {
            let type = form.timeType 
            if(type === 'year') {
                return 'datetime'
            }else if(type === 'month') {
                return ''
            }
        },
        getDates() {
            let arr = []
            for(let i = 1; i <= 31; i++) {
                arr.push({
                    label: i + '号',
                    value: i > 10 ? i + '' : '0' + i
                })
            }
            arr[30].label = '最后一天'
            return arr
        },
        getWeeks() {
            let arr = []
            for(let i = 1; i <= 7; i++) {
                let obj = {}
                switch(i) {
                    case 1:
                    obj.label = '星期一'
                    break
                    case 2:
                    obj.label = '星期二'
                    break
                    case 3:
                    obj.label = '星期三'
                    break
                    case 4:
                    obj.label = '星期四'
                    break
                    case 5:
                    obj.label = '星期五'
                    break
                    case 6:
                    obj.label = '星期六'
                    break
                    case 7:
                    obj.label = '星期日'
                    break
                }
                obj.value = i + ''
                arr.push(obj)
            }
            return arr
        },
        getMins() {
            let arr = []
            for(let i = 1; i <= 60; i++) {
                if(i < 10) {
                    arr.push('0' + i)
                }else{
                    arr.push(i + '')
                }
            }
            return arr
        },
        getTime(timeObj, type='date') {
            if(!timeObj) {
                return ''
            }
            let arr
            if(type === 'time'){
                arr = ['Hour', 'Min', 'Second']
                for(let key in timeObj) {
                    if(arr.indexOf(key) !== -1 && timeObj[key] === '') {
                        return ''
                    }
                }
                return `${timeObj.Hour}:${timeObj.Min}:${timeObj.Second}`
            }
            if(type === 'date'){
                arr = ['Month', 'Day', 'Hour', 'Min', 'Second']
                for(let key in timeObj) {
                    if(arr.indexOf(key) !== -1 && timeObj[key] === '') {
                        return ''
                    }
                }
                return `${new Date().getFullYear()}-${timeObj.Month}-${timeObj.Day} ${timeObj.Hour}:${timeObj.Min}:${timeObj.Second}`
            }
            return ''
        },
        submit() {
            let timeRules = this.form.timeRules
            let getTimeRule = (rule) => {
                delete rule.id
                delete rule.icon
                if(rule.children && rule.children.length > 0) {
                    rule.children.forEach(item => {
                        getTimeRule(item)
                    })
                }
            }
            if(timeRules && timeRules.ruleType) {
                getTimeRule(timeRules)
            }
            let form = Object.assign({}, this.form)
            form = VUE.$handleData(form, {value: 'undefined'}, (obj, key, value) => {
                return {[key]: ''}
            })
            form = VUE.$handleData(form, {key: 'value'}, (obj, key, value) => {
                return {[key]: parseInt(value)}
            })
            if(this.propData.flowId) {
                form.flowId = this.propData.flowId
            }
            form.storyId = this.propData.storyId
            if(!form.timeRules) {
               form.timeRules = {}
            }
            if(this.propData.jobName) {
                form.oldName = this.propData.jobName
            }
            if(this.propData.catalogId) {
                form.catalogId = this.propData.catalogId
            }
            
            let frequencyKey = form.frequency.key
            let url = this.propData.pdfId ? '/api/Job/createPDFJob' : '/api/Job/create'
            if(this.propData.type === 'edit') {
                url = '/api/Job/update'
            }
            form.type = this.propData.catalogType //用于区分历史分支
            form.parentId = this.propData.parentId
            form.pdfId = this.propData.pdfId
            DCHttp.req({
                url: url,
                params: form,
                method: 'post'
            }).then(res => {
                let text = this.propData.type === 'add' ? '添加成功' : '修改成功'
                VUE.$message({
                    message: text,
                    type: 'success',
                    showClose: true
                })
                this.propData.node && this.propData.refreshNode(this.propData.node.parent)
                let data = this.propData
                this.$closeDialog()
                if(this.propData.flowId) {
                    Tree.refreshTree('Story')
                    this.propData.initData && this.propData.initData()
                }
            })
        },
        changeOn(val) {
            if(val) {
                this.dialogVisible = true
            }
        },
        dialogClose() {
            if(this.form.isAdvanced) {
                this.$closeDialog()
            }
        }
    },
    computed: {
        frequency() {
            return this.form.frequency && this.form.frequency.key
        }
    },
    watch: {
        time(val) {
            if(val && this.form.timePoint) {
                let timeArr = val.split(':')
                this.form.timePoint.Hour = timeArr[0]
                this.form.timePoint.Min = timeArr[1]
                this.form.timePoint.Second = timeArr[2]
            }
        },
        cycleTime(val) {
            if(val && this.form.timePoint) {
                let timeArr = val.split(' ')
                timeArr = Array.concat(timeArr[0].split('-'), timeArr[1].split(':'))
                this.form.timePoint.Year = timeArr[0]
                this.form.timePoint.Month = timeArr[1]
                this.form.timePoint.Day = timeArr[2]
                this.form.timePoint.Hour = timeArr[3]
                this.form.timePoint.Min = timeArr[4]
                this.form.timePoint.Second = timeArr[5]
            }
        },
        frequency(val) {
            switch(val) {
                case 'Year':
                if(this.cycleTime) return
                this.cycleTime = this.getNowTime()
                break
                case 'Month':
                if(!this.form.timePoint.Day || this.form.timePoint.Day === '/1') this.form.timePoint.Day = new Date().getDate()
                if(!this.time) this.time = '00:00:00'
                break
                case 'DayOfWeek':
                if(!this.form.timePoint.DayOfWeek) this.form.timePoint.DayOfWeek = new Date().getDay() + ''
                break
                case 'Day':
                if(!this.time) this.time = '00:00:00'
                break
                case 'Hour':
                if(!this.form.timePoint.Min || this.form.timePoint.Min === '/1') this.form.timePoint.Min = '00'
                if(!this.form.timePoint.Second)  this.form.timePoint.Second = '00' 
                break
                case 'Min':
                if(!this.form.timePoint.Second) this.form.timePoint.Second = '00'
                break
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.btn-group{
    text-align: right
}
.bottom-btn{
    text-align: right
}
</style>