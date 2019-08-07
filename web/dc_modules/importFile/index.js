export default {
    name: 'webUploader',
    data () {
      return {
          fileList: [],
          body: {},
          uploadCount: 0,
          fileCount: 0,
          uploadMessage: '',
          successInfo: [],
          errorInfo: [],
          object: {}
      }
    },
    props: [],
    created() {
        this.object = this.$importFile
        this.$nextTick(() => {
            this.fileList = this.$refs.upload.uploadFiles
        })
    },      
    methods: {
        submitUpload() {
            let filter = {}
            if(this.object.form) {
                this.object.submitForm = Object.assign(this.object.form.data, this.object.submitForm)
                for (let key in this.object.submitForm) {
                    filter[key] = encodeURI(this.object.submitForm[key])
                }
            }else {
                this.object.body.FILTER && (filter = JSON.parse(this.object.body.FILTER))
                for(let key in filter) {
                    filter[key] =  encodeURI(filter[key])
                }
            }
            this.object.body.FILTER = JSON.stringify(filter)
            this.object.body.Class = dcConfig.Class[this.object.body.Class] || this.object.body.Class
            this.$refs.upload.submit()
        },
        handleExceed() {
            this.$message({
                type: 'warning',
                message: '文件超出限制数量'
            })
        },
        handleError() {
            this.$message({
                type: 'error',
                message: '上传失败'
            })
        },
        handleSuccess(res, file, fileList) {
            if(!this.fileCount) {
                this.fileCount = fileList.length
            }
            file.status = 'uploading' 
            if(res.STATE == 1) {
                this.uploadCount++
                file.status = 'success'
                this.uploadMessage += `<p style="color: green">${file.name}: 上传成功</p>`
                this.successInfo.push({fileName: file.name, res: res})
            }else{
                this.uploadCount++
                file.status = 'error'
                this.uploadMessage += `<p style="color: red">${file.name}: 上传失败</p>`
                this.errorInfo.push({fileName: file.name, res: res})
            }
            if(this.uploadCount === this.fileCount) {
                this.$notify({
                    title: '上传文件信息',
                    dangerouslyUseHTMLString: true,
                    message: this.uploadMessage,
                    offset: 100
                })
                this.uploadCount = 0
                this.fileCount = 0
                this.uploadMessage = []
                this.uploadMessage = ''
                if(this.successInfo.length > 0) {
                    try{
                        this.object.handleSuccess(this.successInfo)
                    }catch(err){}
                    this.object.close()
                }
                if(this.errorInfo.length > 0) {
                    try{
                        this.object.handleError(this.errorInfo)
                    }catch(err){}
                }
                this.successInfo = []
                this.errorInfo = []
            }
        },
        fileChange(file, fileList) {
            if(this.object.type === 'image') {
                let reader = new FileReader()
                reader.readAsDataURL(file.raw)
                reader.onload = (e) => { 
                    this.$set(file, 'src', reader.result)
                }
            }
            if(this.object.accept.length > 0) {
                let index = file.name.lastIndexOf('.')
                let fileType = file.name.slice(index+1)
                if(this.object.accept.indexOf(fileType) !== -1 && this.fileList.indexOf(file) === -1) {
                    if(!this.object.multiple) {
                        this.fileList.splice(0, 2)
                    }
                        this.fileList.push(file)
                }else{
                    let fileIndex = fileList.indexOf(file)
                    fileList.splice(fileIndex, 1)
                }
            }else{
                if(!this.object.multiple) {
                    this.fileList.splice(0, 2)
                    this.fileList.push(file)
                }
            }
        },
        removeFile(file) {
            let index = this.fileList.findIndex(f => f === file)
            this.fileList.splice(index, 1)
        },
        clear() {
            this.$refs.upload.clearFiles()
            this.fileList = this.$refs.upload.uploadFiles
            this.fileCount = 0
            this.uploadCount = 0
            this.uploadMessage = ''
            this.successInfo = []
            this.errorInfo = []
        },
        close() {
            let cancelArr = []
            for(let i = 0; i < this.fileList.length; i++) {
                if(this.fileList[i].status === 'uploading' || this.fileList[i].status === 'ready') {
                    this.$refs.upload.abort(this.fileList[i])
                    cancelArr.push(this.fileList[i].name)
                }
            }
            if(cancelArr.length > 0) {
                cancelArr.forEach(name => {
                    this.uploadMessage +=  `<p style="color: #000">${name}: 取消上传</p>`
                })
                this.$notify({
                    title: '上传文件信息',
                    dangerouslyUseHTMLString: true,
                    message: this.uploadMessage,
                    offset: 100
                })
            }
            this.object.close()
            this.object.title = '上传文件'
        }
    },
    computed: {
        tips() {
            let tips = ''
            let accept = this.object.accept
            if(accept.length > 0) {
                accept.forEach((item, index) => {
                    if(index !== accept.length - 1) {
                        tips += item + ','
                    }else{
                        tips += item
                    }
                })
            }
            return tips ? '(接受文件类型：'+ tips + ')' : ''
        }
    }
}