<template>
    <div class="content" 
    v-loading="loading" 
    element-loading-text="导入中">
        <div v-if="type==='import'">
            <div class="tools-wrapper">
                <span class="text">{{file}}</span>
                <el-button type="primary" @click="pickFile" :disabled="!(status==0)">选择导入文件</el-button>
            </div>
            <!-- <p v-for="(bar, key) in barData" :key="key" class="bar-wrapper"> 
                <span class="bar-label"><i v-if="bar.msg" class="fa fa-question-circle"></i> {{bar.label}}</span>
                <el-progress :text-inside="true" :stroke-width="14" :percentage="bar.percent ?  parseInt(bar.percent) : 0" :color="barColor(bar.status)"></el-progress>
            </p> -->
            <p>
                <span class="bar-label">总进度：</span>
                <el-progress :text-inside="true" :stroke-width="14" :percentage="pregressPrecent" :color="barColor(pregressStatus)"></el-progress>
            </p>
        </div>
        <div v-else-if="type==='export'">
            <!-- <p v-for="(bar, key) in barData" :key="key"  class="bar-wrapper"> 
                <span class="bar-label"><i v-if="bar.msg" class="fa fa-question-circle"></i> {{bar.label}}</span>
                <el-progress :text-inside="true" :stroke-width="14" :percentage="bar.percent?  parseInt(bar.percent) : 0" :color="barColor(pregressStatus)"></el-progress>
            </p> -->
            <p>
                <span class="bar-label">总进度：</span>
                <el-progress :text-inside="true" :stroke-width="14" :percentage="pregressPrecent" :color="barColor(pregressStatus)"></el-progress>
            </p>
        </div>
        <div v-else-if="type==='custom'">
            <div class="tools-wrapper">
                <span class="text">{{file}}</span>
                <el-button type="primary" @click="pickFile" :disabled="!(status==0)">选择导入文件</el-button>
            </div>
            <div>
                <span>Story:</span>
                <el-select v-model="story" style="width: 300px">
                    <el-option v-for="(item, index) in storyList" :key="index" :value="item.value" :label="item.label"></el-option>
                </el-select>
            </div>
        </div>
        <div style="text-align: center" v-if="loading">
            <i class="el-icon-loading"></i>
            <p>{{loadingText}}</p>
        </div>
        
        <span slot="footer">
            <p class="footer-btns">
                <el-button v-if="msgArr.length>0" @click="checkMsg">查看报错信息</el-button>
                <el-button type="primary" @click="startRun" :disabled="(!(status==0) || (type === 'import' && file === '请选择文件')) && pregressStatus !== 1 && pregressStatus !== 2">开始{{type==='import'||type==='custom'?'导入':'导出'}}</el-button>
                <el-button @click="reset" :disabled="status==0" v-if="type!=='custom'">重置</el-button>
                <el-button @click="close">关闭</el-button>
            </p>
        </span>
        <input type="file" style="display: none" ref="fileDom" @change="fileChange">
    </div>
</template>

<script>
export default {
    name: 'data-IO',
    data () {
        return {
            file: '请选择文件',
            loadingText: '',
            dot: '.',
            loading: false,
            confirm: true,
            loadInterval: '',
            form: '',
            status: 0,
            interval: null,
            barData: {},
            init: false,
            pregressStatus: 0,
            pregressPrecent: 0,
            firstStatus: true, //是否首次进入
            story: '',
            loading: false,
            msgArr: [],
            errTimes: 0,
        }
    },
    created() {
        if(this.type !== 'custom') {
            this.stopRun()
            this.getStatus()
        }
        this.$nextTick(() => {
            setTimeout(() => {
                this.init = true
            }, 200)
            this.storyList && (this.story = this.storyList[0].value)
            
        })
    },
    destoryed() {
        clearInterval(this.interval)
    },
    props: ['propData'],
    computed: {
        type() {
            return this.propData.type
        },
        text() {
            if(this.propData.type === 'import') {
                return '导入'
            }else if(this.propData.type === 'export') {
                return '导出'
            }
        },
        storyList() {
            return this.propData.storyList
        }
    },
    methods: {
        pickFile() {
            this.$refs.fileDom.click()
        },
        fileChange() {
            let name = 'zipFile'
            this.type === 'custom' && (name = 'customFile')
            let form = new FormData()
            form.append('action', dcConfig.uploadAction)
            form.append(name, this.$refs.fileDom.files[0])
            if(this.type === 'import') {
                form.append('FILTER', '{}')
            }
            this.file = this.$refs.fileDom.files[0].name
            this.form = form
        },
        fileSelected(event) {
            this.file = event.target.value
        },
        startRun() {
            this.msgArr = []
            if(this.type !== 'custom') {
                this.stopRun()
            }
            if(this.type === 'export') {
                DCHttp.req({
                    url: dcConfig.publicPath,
                    params: {
                        Class: 'SystemMgr',
                        FUNC: 'exportZipFile'
                    }
                }).then(res => {
                    this.$message({
                        message: '开始导出数据',
                        showClose: true
                    })
                    this.getStatus()
                    this.interval = setInterval(() => {
                        this.getStatus()
                    }, 800)
                })
            }else if(this.type === 'import'){
                this.form.append('Class', dcConfig.Class.SystemMgr)
                this.form.append('FUNC', 'importZipFile2')
                DCHttp.import(this.form).then(res => {
                    if(res) {
                        this.$message({
                            message: '开始导入',
                            showClose: true
                        })
                        this.getStatus()
                        this.interval = setInterval(() => {
                            this.getStatus()
                        }, 1000)
                    }
                })
            }else if(this.type === 'custom') {
                this.form.append('Class', dcConfig.Class.SystemMgr)
                this.form.append('FUNC', 'importCustomFile')
                let filter = JSON.stringify({storyName: encodeURI(this.story)})
                this.form.append('FILTER', filter)
                this.loading = true
                let file = this.form.get('content')
                // let reader = new FileReader()
                // reader.readAsText(file)
                // reader.onload = () => {
                    // DCHttp.ebook({
                    //     params: {
                    //         Class: 'SystemMgr',
                    //         FUNC: 'importCustomFile',
                    //         content: reader.result,
                    //         storyName: this.story,
                    //         action: dcConfig.uploadAction
                    //     },
                    //     method: 'post'
                    // }).then(res => {
                    //     this.$message({
                    //         message: '导入成功'
                    //     })
                    //     this.$closeDialog()
                    //     this.loading = false
                    // }).catch(err => {
                    //     this.loading = false
                    // })
                // }
                
                DCHttp.import(this.form).then(res => {
                    this.$message({
                        message: '导入成功',
                        showClose: true
                    })
                    this.$closeDialog()
                    this.loading = false
                }).catch(err => {
                    this.loading = false
                })
            }
        },
        stopRun() {
            let params = {
                Class: 'SystemMgr'
            }
            this.msgArr = []
            if(this.type === 'export') {
                params.FUNC = 'cancelExport'
            }else{
                params.FUNC = 'cancelImport'
            }
            return new Promise((resolve, reject) => {
                DCHttp.req({
                    url: dcConfig.publicPath,
                    params
                }).then(res => {
                    this.status = 0
                    this.pregressStatus = 0
                    clearInterval(this.interval)
                    resolve()
                })
            })
            
        },
        reset() {
            this.stopRun().then(() => {
                this.getStatus()
            })
        },
        close() {
            clearInterval(this.interval)
            this.$closeDialog()
        },
        getStatus() {
            let params = {Class: 'SystemMgr'}
            if(this.type === 'export') {
                params.FUNC = 'getExportProcessDetail'
            }else{
                params.FUNC = 'getImportProcessDetail'
            } 
            if(this.errTimes < 5){
                DCHttp.req({
                    url: dcConfig.publicPath,
                    params
                }).then(res => {
                    this.errTimes = 0;
                    this.status = res.CONTENT.STATUS
                    this.barData = res.CONTENT.DETAIL
                    let detail = res.CONTENT.DETAIL
                    let progressData = Object.values(detail)
                    let sum = 0
                    this.pregressStatus = 3
                    this.pregressStatus = res.CONTENT.STATUS
                    this.msgArr = []
                    progressData.forEach(item => {
                        if(item.status == 2) {
                            this.pregressStatus = 2
                            this.status = 2
                        }
                        if(item.msg && item.status == 0) {
                            this.msgArr.push(item.msg)
                        }
                        sum += parseInt(item.percent)
                    })
                    this.pregressPrecent = parseInt(sum / progressData.length) ? parseInt(sum / progressData.length) : 0
                    if(this.pregressPrecent == 100) {
                        this.pregressStatus = 1
                        this.status = 1
                    }
                    this.firstStatus = false
                }).catch(err => {
                    this.stopRun()
                    this.errTimes++
                })
            }else{
                clearInterval(this.interval);
                this.interval = null;
            }
            
        },
        // 进度条颜色
        barColor(status) {
            if(status == 1) {
                return '#67c23a'
            }else if(status == 2) {
                return '#f56c6c'
            }else if(status == 3) {
                return '#409eff'
            }else{
                return '#fff'
            }
        },
        checkMsg() {
            let str = ''
            this.msgArr.forEach(item => {
                str += item + '<br>'
            })
            this.$alert(str, '报错信息', {
                dangerouslyUseHTMLString: true
            })
        }
    },
    watch: {
       status(val) {
            if(val == 1) {
                    if(this.init) {
                        this.$message({
                            type: 'success',
                            message: `${this.text}成功`,
                            showClose: true
                        })
                        clearInterval(this.interval)
                        if(this.type === 'export') {
                            DCHttp.export({
                                url: dcConfig.publicPath,
                                params: {
                                    Class: 'SystemMgr',
                                    FUNC: 'getExportContent'
                                }
                        })
                        }else{
                            Tree.refreshTree('Story')
                        }
                    }
            }else if(val == 2) {
                if(this.init) {
                    this.$message({
                        type: 'error',
                        message: `${this.text}出错`,
                        showClose: true
                    })
                    clearInterval(this.interval)
                }
            }
       }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
    .content{
        margin-top: 0;
    }
    .el-progress{
        display: inline-block;
        width: 88%;
        margin: 4px;
    }
    p{
        padding: 0;
        margin: 0;
    }
    .bar-label{
        display: inline-block;
        width: 10%;
        text-align: right;
        font-size: 12px;
    }
    .text{
        display: inline-block;
        width: 80%;
        height: 30px;
        border: 1px solid #ccc;
        vertical-align: center;
        margin-right: 10px;
        line-height: 30px;
        text-indent: 6px;
        border-radius: 2px;
    }
    .el-icon-loading{
        font-size: 80px;
    }
    .footer-btns{
        text-align: right;
        margin-top: 20px;
    }
    .tools-wrapper{
        margin-bottom: 20px;
    }
</style>
