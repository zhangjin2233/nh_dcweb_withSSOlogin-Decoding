import importFileConfig from '@/config/importFile.js'
class ImportFile {
    constructor() {
        this.show = false
        this.origin = importFileConfig.origin
        this.name = importFileConfig.name
        this.type = 'file'
        this.limit = importFileConfig.limit
        this.multiple = importFileConfig.multiple
        this.action = importFileConfig.action
        this.width = importFileConfig.width
        this.accept = importFileConfig.accept
        this.btnAlign = importFileConfig.btnAlign
        this.top = importFileConfig.top
        this.title = importFileConfig.title
        this.url = ''
        this.params = {}
        this.body =  {action: this.action}
        this.form = null
        this.submitForm = {}
    }
    open(obj) {
        this.form = null
        this.submitForm = {}
        if(obj && typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        }
        this.show = true
        // if(this.url) {
        //     let arr = this.url.split('&')
        //     arr.forEach(item => {
        //         let itemArr = item.split('=')
        //         this.body[itemArr[0]] = itemArr[1]
        //     })
        // }
        this.body = Object.assign(this.body, this.params)
        return this
    }
    reset(obj) {
        let newObj = Object.assign(new dc.ImportFile(), obj)
        for(let key in newObj) {
            this[key] = newObj[key]
        }
        return this
    }
    close() {
        this.show = false
        return this
    }
    handleSuccess(res) {
    }
    handleError(err) {  
    }
    set(attra, val) {
        this[attra] = val
        return this
    }
    get(attra) {
        return this[attra]
    }
}

export default ImportFile