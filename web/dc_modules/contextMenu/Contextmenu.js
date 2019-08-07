import contextmenuConfig from '@/config/contextmenu.js'
class Contextmenu {
    constructor(obj) {
        this.style = Object.assign({}, contextmenuConfig.style)
        this.itemHoverStyle = Object.assign({},contextmenuConfig.itemHoverStyle)
        this.itemStyle = Object.assign({},contextmenuConfig.itemStyle)
        this.menu = []
        this.show = false
        this.currentItem = {}
        this.params = []
        if(typeof obj === 'object') {
            for(let key in obj) {
                this[key] = obj[key]
            }
        }
    }
    createMenu(obj) {
        if(typeof obj === 'object') {
            for(let key in obj) {
                if(key !== 'style') {
                    this[key] = obj[key]
                }else{
                    this[key] = Object.assign(this[key], obj[key])
                }
                
            }
        }
        return this 
    }
    setPosition(x, y) {
        this.style.left = x + 'px'
        this.style.top = y + 'px'
        return this
    }
    setPositionByEvent(event) {
        this.style.left = event.clientX  - 6 + 'px'
        this.style.top = event.clientY - 6 + 'px'
        return this
    }
    setStyle(style) {
        this.style = Object.assign(this.style, style) 
        return this
    }
    setItemStyle(style, type) {
        if(type === 'hover') {
            this.itemHoverStyle = style
        }else{
            this.itemStyle = style
        }
        return this
    }
    showMenu(positon, menu) {
        let diffY = 6, diffX = 6; //弹窗起始位置偏移量
        if(positon instanceof Array) {
            this.style.left = positon[0] - diffX + 'px'
            this.style.top = positon[1] - diffY +'px'
        }else if(positon instanceof Event){
            //如果所在位置是一个有绝对定位可视区中心居中的弹窗，计算其弹窗位置并修改偏移量
            let dialogDom = positon.path.find(item=>(typeof item.className === 'string') && item.className.split(' ')[0] === "el-dialog");
            if(dialogDom && window.getComputedStyle(dialogDom).position == 'absolute'){
                const clientRect = dialogDom.getBoundingClientRect();
                diffY += (window.innerHeight - clientRect.height) / 2;
                diffX += (window.innerWidth - clientRect.width) / 2;   
            }
            this.style.left = positon.clientX - diffX + 'px'
            this.style.top = positon.clientY - diffY + 'px'
        }
        this.show = true
        this.menu = menu
        return this
    }
    setWidth(val) {
        this.style['min-width'] = val
        return this
    }
    setHeight(val) {
        this.style.height = val
        return this
    }
    updateItem(item, ...text) {
        let menu = this.menu
        for(let i = 0; i < text.length; i++) {
            let index = menu.findIndex(m => m.text === text[i])
            if(i !== text.length - 1) {
                menu = menu[index].children
            }else {
                menu[index] = Object.assign(menu[index], item) 
            }
            
        }
        return this
    }
    hideMenu() {
        this.show = false
        this.currentItem = {}
        return this
    }
}

export default Contextmenu