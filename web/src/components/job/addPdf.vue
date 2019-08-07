<template>
    <div>
        <el-checkbox v-model="isCheck" v-if="propData.noCheck">检查引用节点是否已加入Job</el-checkbox>
        <dc-tree :object="tree"></dc-tree>
        <p class="btns">
            <el-button type="primary" size="mini" @click="submit">确定</el-button>
            <el-button @click="$closeDialog" size="mini">取消</el-button>
        </p>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['propData'],
    data() {
        let _this = this
        return {
            isCheck: true,
            tree: new dc.Tree({
                selectType: ['PDF'],
                height: '240px',
                lazy: true,
                key: 'link',
                loadType: ['RequirementRoot', 'DesignAndDevelopRoot', 'RuntimeRoot', 'SDCRoot', 'SDFRoot', 'ADCRoot', 'ADFRoot', 'PDFJobRoot', 'JobRoot', 'SDCFolder', 'SDFFolder', 'CDCFolder', 'PDCFolder','ADCFolder', 'ADFFolder', 'CDFFolder', 'PDFFolder','SDFFolder', 'PDFJobFolder', 'JobFolder', 'Job', 'PDFJob', 'ADC', 'ADF', 'CDF', 'queueGroup', 'SUDFRoot', 'SUDFFolder'],
                initData(tree) {
                    DCHttp.req({ url: '/api/catalog/nodeTree', params: { type: 'PDF', storyId: _this.propData.storyId }}).then(res => {
                        tree.data = res
                        tree.defaultExpandedKeys = [res[0].link]
                    })
                },
                loadNode(node, resolve) {
                    let data = node.data
                    let params = {
                        id: data.id,
                    }
                    DCHttp.req({url: '/api/catalog/children', params}).then(res => {
                        resolve(res.data)
                    }).catch(err => {
                        resolve([])
                    })
                },
            })
        }
    },
    created() {
    },
    watch: {},
    computed: {},
    methods: {
        submit() {
            if(!(this.tree.nodeSelection && this.tree.nodeSelection[0])) {
                this.$message('请选择节点再提交')
                return
            }
            if(this.propData.type === 'createPDFJob') {
                let data = this.propData
                data.type = 'create'
                data.pdfId = this.tree.nodeSelection[0].link
                VUE.$closeDialog()
                VUE.$openDialog(new dc.Dialog({
                    title:  '新建固定周期调度流',
                    component: 'jobForm',
                    width: '500px',
                    data
                })) 

            } else {
                DCHttp.req({
                    url: dcConfig.publicPath,
                    params: {
                        Class: 'JobMgr',
                        FUNC: 'addPDF',
                        [dcConfig.paramsKey]: {
                            jobId: this.propData.jobId,
                            checkReferenceNode: this.isCheck,
                            pdfId: this.tree.nodeSelection[0].link
                        }
                    }
                }).then(res => {
                    this.$closeDialog()
                    this.$successMessage('添加成功')
                    this.propData.refresh && this.propData.refresh()
                })
            }
            
        }
    },
}
</script>
<style scoped>
.btns{
    text-align: right;
}
</style>