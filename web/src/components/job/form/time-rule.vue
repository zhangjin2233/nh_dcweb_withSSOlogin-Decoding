<template>
    <div class="time-rule">
        <el-row>
            <el-col :span="18">
                <div class="tools">
                    <el-button-group>
                        <el-button v-for="(item, index) in btnConfig" :key="index" :disabled="setDisabled(item)" :title="item.title" :class="item.class" :style="`color: ${item.color}`" @click="item.methods">{{item.label}}</el-button>
                    </el-button-group>
                    <el-select v-model="currentNode.ruleType" v-if="currentNode && (currentNode.ruleType === 'and' || currentNode.ruleType === 'or')" style="width: 120px">
                        <el-option label="or" value="or"></el-option>
                        <el-option label="and" value="and"></el-option>
                    </el-select>
                </div>
                <div class="text-body" :class="{'time-rules-show': currentNode.ruleType === 'schedule', 'bottom-time-show': currentNode.ruleType === 'timePointRule' || currentNode.ruleType === 'cycleRule' || currentNode.ruleType === 'cycleRule', 'bottom-define-show': currentNode.ruleType === 'userRule'}">
                    <el-tree
                    ref="ruleTree"
                    :data="ruleTree"
                    accordion
                    :default-expanded-keys="expandedKeys"
                    :expand-on-click-node="false"
                    node-key="id"
                    empty-text=""
                    :props="{
                        children: 'childRules'
                    }"
                    :highlight-current="true"
                    @node-click="handleNodeClick">
                        <span slot-scope="{ node, data }">
                            <i :class="data.icon"></i>
                            <span v-text="getNodeLabel(data)"></span>
                        </span>
                    </el-tree>
                </div>
                <div class="bottom-content-filter" v-if="currentNode.ruleType === 'schedule'">
                    <el-row>
                        <el-col :span="2">
                            <span>年：</span>
                        </el-col>
                        <el-col :span="10">
                            <el-input size="mini" placeholder="不限" v-model="currentNode.Year"></el-input>
                        </el-col>
                        <el-col :span="2">
                            <span>月：</span>
                        </el-col>
                        <el-col :span="10">
                            <el-input size="mini" placeholder="不限" v-model="currentNode.Month"></el-input>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="2">
                            <span>日：</span>
                        </el-col>
                        <el-col :span="10">
                            <el-input size="mini" placeholder="不限" v-model="currentNode.Day"></el-input>
                        </el-col>
                        <el-col :span="2">
                            <span>星期：</span>
                        </el-col>
                        <el-col :span="10">
                            <el-input size="mini" placeholder="不限" v-model="currentNode.DayOfWeek"></el-input>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="2">
                            <span>时：</span>
                        </el-col>
                        <el-col :span="10">
                            <el-input size="mini" placeholder="不限" v-model="currentNode.Hour"></el-input>
                        </el-col>
                        <el-col :span="2">
                            <span>分：</span>
                        </el-col>
                        <el-col :span="10">
                            <el-input size="mini" placeholder="不限" v-model="currentNode.Min"></el-input>
                        </el-col>
                    </el-row>
                    <el-popover
                    placement="right"
                    width="400"
                    trigger="hover">
                        <article>
                            <p>1、穷举，直接写出具体的值，以逗号分隔，例如：2016，2017，2018</p>
                            <p>2、指定范围，以减号“-”连接，例如：2016-2018，1-5，0-9</p>
                            <p>3、指定整除数，以“/”开头，表示能被此数整除即满足条件，比如希望每隔15分钟可以写成/15，表示0，15，30，45，60均符合条件</p>
                            <p>4、支持倒数第几，以减号“-”开头的负数，比如：-1可表示每月最后一天（注：倒数不支持范围，即不能完成20-1或者-2-1这样，也不支持年）</p>
                            <p>5、支持!=（不等于），>（大于），>=（大于等于），&lt;（小于），&lt;=（小于等于）（注：“不等于”通常不能在单一表达式中混用，否则等于无效）</p>
                            <p>6、以上这些均可自由组合，以逗号分隔</p>
                            <p>举例</p>
                            <p>以年为例：“2012-2014，2016，2018”表示2012年到2014年以及2016年、2018年都符合条件</p>
                            <p>以月为例：“1，/4，11”表示1月，所有能被4整除的月份以及11月</p>
                            <p>以天为例：“1-5，15，-1”表示1到5号，15号以及最后一天</p>
                            <p>以分钟为例：“0-10，/15，59”表示0到10分钟以及所有能整除15的分钟以及59分钟都满足条件</p>
                        </article>
                    <p slot="reference" class="time-rule-title">时间规则填写规范<i class="el-icon-question"></i></p>
                    </el-popover>
                </div>
                <div class="bottom-content-time" v-if="currentNode.ruleType === 'timePointRule' || currentNode.ruleType === 'cycleRule' || currentNode.ruleType === 'cycleRule'">
                    <p>
                        <span>忽略日期：</span>
                        <el-switch
                        v-model="currentNode.isIgnoreDate">
                        </el-switch>
                    </p>
                    <p>
                        <span>基准时间</span>
                        <el-date-picker
                        v-if="!currentNode.isIgnoreDate"
                        v-model="currentNode.stdTime"
                        type="datetime"
                        key="date"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        placeholder="选择日期时间">
                        </el-date-picker>
                        <el-time-picker
                        v-else
                        key="time"
                        @change="timeChange()"
                        v-model="currentNode.time"
                        value-format="HH:mm:ss"
                        :picker-options="{
                        selectableRange: '00:00:00 - 23:59:59'
                        }"
                        placeholder="任意时间点">
                    </el-time-picker>
                    </p>
                    <p v-if="currentNode.ruleType === 'timePointRule'">
                        <span>时间间隔（操作符）</span>
                        <el-select v-model="currentNode.operator">
                            <el-option label=">=" :value="2"></el-option>
                            <el-option label=">" :value="1"></el-option>
                            <el-option label="=" :value="3"></el-option>
                            <el-option label="!=" :value="6"></el-option>
                            <el-option label="<" :value="4"></el-option>
                            <el-option label="<=" :value="5"></el-option>
                        </el-select>
                    </p>
                    <p v-if="currentNode.ruleType === 'cycleRule'">
                        <span>时间间隔（分）</span>
                        <el-input v-model="currentNode.intervalMins" style="width: 120px"></el-input>
                    </p>
                    <!-- <p v-if="currentNode.ruleType === 'cycleRule'">
                        <span>时间间隔（秒）</span>
                        <el-input v-model="currentNode.intervalSecs" style="width: 120px"></el-input>
                    </p> -->
                </div>
                <div class="bottom-content-define" v-if="currentNode.ruleType === 'Rule_User_Define'">
                    <p>注：使用该规则需配合相关插件一同工作</p>
                    <p>
                        <el-input
                        type="textarea"
                        :autosize="{ minRows: 4, maxRows: 4}"
                        placeholder="请输入内容"
                        v-model="currentNode.defineText">
                        </el-input>
                    </p>
                </div>


            </el-col>
            <el-col :span="6" class="right-side">
                <!-- <p>
                    <span>Date:</span>
                    <el-date-picker
                    v-model="date"
                    size="mini"
                    type="date"
                    style="width: 80%"
                    placeholder="选择日期">
                    </el-date-picker>
                </p>
                <p>
                    <span>time:</span>
                    <el-time-picker
                    v-model="time"
                    size="mini"
                    style="width: 80%"
                    placeholder="选择时间">
                    </el-time-picker>
                </p> -->
                <div>
                    <h3 class="time-title">预览时间轴</h3>
                    <p class="time-body">
                        <span class="time-item" v-if="timeList.length > 0" v-for="(item, index) in timeList" :key="index">{{item}}</span>
                    </p>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: 'timeRule',
    data () {
      return {
        btnConfig: [
            {
                title: '新增"与"逻辑',
                class: '',
                color: '#000',
                label: 'and',
                methods: this.addAnd,
            }, {
                title: '新增"或"逻辑',
                class: '',
                color: '#000',
                label: 'or',
                methods: this.addOr,
            }, {
                title: '过滤规则',
                class: 'fa fa-filter',
                color: 'blue',
                label: '',
                methods: this.addFilter,
            }, {
                title: '时间点规则',
                class: 'fa fa-history',
                color: '#000',
                label: '',
                methods: this.addTime,
            }, {
                title: '循环间隔规则',
                class: 'fa fa-circle-o-notch',
                color: 'green',
                label: '',
                methods: this.addCycle,
            }, 
            // {
            //     title: '秒级规则',
            //     class: 'fa fa-clock-o',
            //     color: 'blue',
            //     label: '',
            //     methods: this.addSecond,
            // }, 
            {
                title: '用户自定义规则',
                class: 'fa fa-file-text-o',
                color: '#000',
                label: '',
                methods: this.addDefine,
            }, {
                title: '删除',
                class: 'fa fa-remove',
                color: 'red',
                label: '',
                methods: this.removeNode,
            }
        ],
        currentNode: {},
        date: '',
        time: '',
        ruleTree: [],
        expandedKeys: [],
        currentNodeParent: {},
        currentNodeIndex: 0,
        timeList: [],
        iconMap: {
            schedule: 'fa fa-filter',
            timePointRule: 'fa fa-history',
            cycleRule: 'fa fa-circle-o-notch',
            userRule: 'fa fa-file-text-o'
        }
      }
    },
    props: ['data', 'timeRules'],
    created() {
        this.$nextTick(() => {
            let id = 0
            let insertId = (node) => {
                let obj = {
                    id: id
                }
                this.expandedKeys.push(id)
                node.id = id
                id++
                if(node.childRules && node.childRules.length > 0) {
                    node.childRules.forEach(item => {
                        item.icon = this.iconMap[item.ruleType]
                        if(item.ruleType === 'timePointRule') {
                            item.time = item.stdTime.split(' ')[1]
                        }
                        insertId(item)
                    })
                }
            }
            if(this.timeRules && this.timeRules.ruleType) {
                insertId(this.timeRules)
                this.ruleTree.push(this.timeRules)
                this.currentNode = this.timeRules
                this.$nextTick(() => {
                    this.$refs.ruleTree.setCurrentKey(0)
                })      
            }
        })
    },
    methods: {
        btnClick(type) {
        },
        setDisabled(item) {
            let flag =  this.currentNode.ruleType
            if(flag) {
                if(flag === 'or' || flag === 'and') {
                    return false
                }else{
                    if(item.title === '删除') {
                        return false
                    }
                        return true
                }
            }
            return false
        },
        handleNodeClick(node) {
            this.currentNode = node
        },
        addAnd() {
            let node = {
                value: 'and',
                fruleType: 'and',
                isIgnoreDate: false,
                id: new Date().getTime(),
                childRules: []
            }
            this.addNode(node)
        },
        addOr() {
            let node = {
                value: 'or',
                ruleType: 'or',
                id: new Date().getTime(),
                childRules: []
            }
            this.addNode(node)
        },
        addFilter() {
            let node = {
                value: '',
                ruleType: 'schedule',
                Year: '',
                Month: '',
                Day: '',
                Hour: '',
                DayOfWeek: '',
                Min: '',
                id: new Date().getTime(),
                childRules: [],
                icon: 'fa fa-filter'
            }
            this.addNode(node)
        },
        addTime() {
            let node = {
                timeOperator: 2,
                isIgnoreDate: false,
                stdTime: this.getTimeString('date'),
                time: this.getTimeString('time'),
                ruleType: 'timePointRule',
                id: new Date().getTime(),
                childRules: [],
                icon: 'fa fa-history'
            }
            this.addNode(node)
        },
        addCycle() {
            let node = {
                intervalMins: 1,
                isIgnoreDate: true,
                date: this.getTimeString('date'),
                time: this.getTimeString('time'),
                ruleType: 'cycleRule',
                id: new Date().getTime(),
                childRules: [],
                icon: 'fa fa-circle-o-notch'
            }
            this.addNode(node)
        },
        addSecond() {
            let node = {
                intervalSecs: 30,
                isIgnoreDate: false,
                date: this.getTimeString('date', 'second'),
                time: this.getTimeString('time', 'second'),
                ruleType: 'cycleRule',
                id: new Date().getTime(),
                childRules: [],
                icon: 'fa fa-clock-o'
            }
            this.addNode(node)
        },
        addDefine() {
            let node = {
                ruleType : 'userRule',
                id: new Date().getTime(),
                childRules: [],
                id: new Date().getTime(),
                icon: 'fa fa-file-text-o',
                defineText: ''
            }
            this.addNode(node)
        },
        removeNode() {
            if(this.currentNode === this.ruleTree[0]) {
                this.ruleTree = []
                this.currentNode = {}
            }else{
                this.setParentNode(this.ruleTree[0])
                this.currentNodeParent.childRules.splice(this.currentNodeIndex, 1)
                this.currentNode = this.currentNodeParent
                this.$refs.ruleTree.setCurrentKey(this.currentNode.id)
            }
        },
        setParentNode(node) {
            if(node.childRules.length > 0) {
                node.childRules.forEach((item, index) => {
                    if(item === this.currentNode) {
                        this.currentNodeParent = node
                        this.currentNodeIndex = index
                        return
                    }else{
                        this.setParentNode(item)
                    }
                })
            }
        },
        addNode(obj) {
            if(this.ruleTree.length === 0) {
                this.ruleTree.push(obj)
            }else{
                let node = this.currentNode 
                node.childRules.push(obj)
                let index = this.expandedKeys.findIndex(e => e === obj.id)
                if(index === -1) {
                    this.expandedKeys.push(obj.id)
                }
            }
            this.currentNode = obj
            this.$nextTick(() => {
                this.$refs.ruleTree.setCurrentKey(obj.id)
            })  
        },
        getTimeString(type, time='min') {
            let now = new Date()
            let year = now.getFullYear()
            let month = now.getMonth() + 1
            let date = now.getDate()
            let hour = now.getHours()
            let min = now.getMinutes()
            let second = now.getSeconds()  
            second = second < 10 ? '0' + second : second
            let day = now.getDay()
            if(type === 'date') {
                return `${year}-${month > 9 ? month : '0' + month}-${date > 9 ? date : '0' + date} ${hour}:${min < 10 ? '0' + min: min}:${time==='second'?second:'00'}`
            }else if(type === 'benchmark') {
                let weekDay = (day) => {
                    switch(day) {
                        case '0':
                        return '星期日'
                        case '1':
                        return '星期一'
                        case '2':
                        return '星期二'
                        case '3':
                        return '星期三'
                        case '4':
                        return '星期四'
                        case '5':
                        return '星期五'
                        case '6':
                        return '星期六'
                    }
                }
                let noonHour = (hour) => {
                    if(hour > 12) {
                        return '上午' + 12
                    }
                    return '下午' + (hour - 1)
                }
                return `${year}年${month}月${date}日 ${weekDay} ${noonHour}时${min < 10 ? '0' + min: min}分00秒 CST`
            }else if(type === 'time') {
                return `${hour}:${min < 10 ? '0' + min: min}:${time==='second'?second:'00'}`
            }
        },
        getNodeLabel(node) {
            switch (node.ruleType) {
                case 'and':
                return 'and'
                case 'or':
                return 'or'
                case 'schedule':
                let str = ''
                let ruleMap = node
                let getStr = (key, unit) => {
                    if(ruleMap[key] !== '' && ruleMap[key] !== null) {
                        if(key === 'DayOfWeek') {
                            return `${unit}(${ruleMap[key]})`
                        }
                        return `(${ruleMap[key]})${unit}`
                    }
                    return ''
                }
                str = getStr('Year', '年') + getStr('Month', '月') + getStr('Day', '号') + getStr('DayOfWeek', '星期') + getStr('Hour', '点') + getStr('Min', '分')
                if(str) {
                    let reduce =  Array.prototype.reduce
                    str = reduce.call(str, (x, y) => {
                        if(y === '年' || y === '月' || y === '号' || y === '点') {
                            return x + y + ' '
                        }else{
                            return x + y
                        }
                    }, '')
                    let index = str.indexOf(`星期(${ruleMap.DayOfWeek})`)
                    if(index !== -1) {
                        let start = index + 6
                        str = str.slice(0, start) + ' ' + str.slice(start)
                    }
                }
                return (str === '' ? '不限' : str)
                case 'timePointRule':
                let getTimeOperator = (val) => {
                    let value = val + ''
                    switch(value) {
                        case '1':
                        return '>'
                        case '2':
                        return '>='
                        case '3':
                        return '='
                        case '4':
                        return '<'
                        case '5':
                        return '<='
                        case '6':
                        return '!='
                    }
                }
                if(node.isIgnoreDate) {
                    return getTimeOperator(node.operator) + node.stdTime.split(' ')[1]
                }
                return getTimeOperator(node.operator) + node.stdTime
                case 'cycleRule':
                if(node.isIgnoreDate) {
                    return `${node.time}(/${node.intervalMins}min)`
                }
                return `${node.date}(/${node.intervalMins}min)`
                case 'cycleRule':
                if(node.isIgnoreDate) {
                    return `${node.time}(/${node.intervalSecs}s)`
                }
                return `${node.date}(/${node.intervalSecs}s)`
                case 'userRule':
                return '用户自定义规则'
            }
        },
        getTimeList() {
            let timeRule = this.ruleTree[0]
            DCHttp.req({
                url: '/api/Job/opTimeAxis',
                params: { timeRule },
                method: 'post'
            }).then(res => {
                this.timeList = res
            })
        },
        timeChange() {
            let arr = this.currentNode.stdTime.split(' ')
            arr[1] = this.currentNode.time
            this.currentNode.stdTime = arr.join(' ')
        }
    },
    watch: {
        ruleTree: {
            deep: true,
            handler(val) {
                this.$emit('getTimeRule', val[0])
                // if(val && val[0] && val[0].flag) {
                //     let str = JSON.stringify(val[0])
                //     if(str.indexOf('schedule') != -1) {
                        this.getTimeList()
                    // }
                // }
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .el-button{
        font-size: 12px;
        line-height: 14px;
    }
    .time-rule{
       overflow: hidden;
    }
    .right-side{
        padding-left: 20px
    }
    .time-title{
        text-align: center;
        background-color: #ccc;
        margin: 0;
    }
    .time-item{
        display: block;
        font-size: 12px;
    }
    article{
        font-size: 12px;
        p{
            margin: 0;
            padding: 0;
        }
    }
    .bottom-content-filter{
        .el-row{
            text-align: right;
            margin: 4px 0;
        }
    }
    .time-rule-title{
        cursor: pointer;
    }
    .time-rule-title:hover{
        color: blue
    }
    .fa-filter{
        color: blue
    }
    .bottom-content-time{
        span{
            display: inline-block;
            width: 140px;
        }
    }
    @media screen and (max-height: 660px) {
        .text-body{
            width: 100%;
            height: 240px;
            border: 1px solid #ccc;
            overflow: auto;
            margin-top: 10px;
        }
        .time-body{
            border: 1px solid #ccc;
            height: 260px;
            margin: 0;
            overflow: auto;
            text-align: center;
            font-size: 12px;
        }
        .bottom-time-show{
            height: 96px;
        }
        .bottom-define-show{
            height: 90px;
        }
        .time-rules-show{
            height: 92px;
        }
    }
     @media screen and (min-height: 660px) and (max-height: 2000px) {
        .text-body{
            width: 100%;
            height: 450px;
            border: 1px solid #ccc;
            overflow: auto;
            margin-top: 10px;
        }
        .time-rules-show{
            height: 292px;
        }
        .time-body{
            border: 1px solid #ccc;
            height: 470px;
            margin: 0;
            overflow: auto;
            text-align: center;
            font-size: 12px;
        }
        .bottom-time-show{
            height: 300px;
        }
        .bottom-define-show{
            height: 284px;
        }
    }
</style>
