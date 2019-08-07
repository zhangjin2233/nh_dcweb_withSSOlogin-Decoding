class FrameSet {
    constructor() {
        this.list = []
        this.positionInfo = {
            leftTop: {
                left: '10px',
                top: '10px'
            },
            rightTop: {
                right: '10px',
                top: '10px'
            },
            leftBottom: {
                left: '10px',
                bottom: '10px'
            },
            rightBottom: {
                right: '10px',
                bottom: '10px'
            }
        }
        this.position = 'leftBottom' 
    }
    openFrame(obj) {
        if(obj instanceof dc.Frame) {
            obj.id = new Date().getTime() + this.list.length + ''
            this.list.push(obj)
        }
    }
    closeFrame(id) {
        if(id) {
            let index = this.list.findIndex(l => l.id === id)
            this.list.splice(index, 1)
        }else{
            this.list.splice(-1, 1)
        }
    }
    setMiniPosition(val) {
        this.position = val
    }
}

export default FrameSet