class DialogSet {
    constructor() {
        this.list = []
    }
    addDialog(dialog) {
        this.list.push(dialog)
    }
    removeDialog(dialog) {
        if(dialog) {
            let index = this.list.indexOf(dialog)
            if(dialog !== -1) {
                this.list.splice(index, 1)
            }
        }else{
            this.list.splice(this.list.length - 1, 1)
        }
    }
    removeAllDialog() {
        this.list = []
    }
}

export default DialogSet