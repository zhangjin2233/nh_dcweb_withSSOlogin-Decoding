
import frameConfig from '@/config/frame.js'
class Frame{
    constructor(obj) {
        this.id = 'frame1'
        this.show = true
        this.title = ''
        this.left = frameConfig.left
        this.top = frameConfig.top
        this.width = frameConfig.width
        this.height = frameConfig.height
        this.backgroundColor = frameConfig.backgroundColor
        this.headerBackgroundColor = frameConfig.headerBackgroundColor
        this.color = frameConfig.color
        this.html = ''
        this.minimization = frameConfig.minimization
        this.maximization = frameConfig.maximization
        this.zIndex = frameConfig.zIndex
        this.data = {}
        this.fontSize = frameConfig.fontSize
        this.component = ''
        if(obj && typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        }
    }
    colse() {

    }
    reset(obj) {
        let newObj = Object.assign(new dc.Frame(), obj)
        for(let key in newObj) {
            this[key] = newObj[key]
        }
        return this
    }
    set(attra, val) {
        this[attra] = val
        return this
    }
    get(attra) {
        return this[attra]
    }
}

export default Frame