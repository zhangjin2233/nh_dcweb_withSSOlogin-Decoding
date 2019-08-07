let nodeIcons = require('../../conf/dc_tree.json').icons
let fs = require('fs')
let path = require('path')
const rp = require('request-promise')
module.exports = {
    formatTime(time) {
        let dateTime
        if (typeof time === 'string') {
            let arr = time.split(' ')
            arr = [].concat(arr[0].split('-'), arr[1].split(':'))
            dateTime = new Date()
            dateTime.setFullYear(parseInt(arr[0]))
            dateTime.setMonth(parseInt(arr[1]) - 1)
            dateTime.setDate(parseInt(arr[2]))
            dateTime.setHours(parseInt(arr[3]))
            dateTime.setMinutes(parseInt(arr[4]))
            dateTime.setSeconds(parseInt(arr[5]))
            return parseInt(dateTime.getTime() / 1000) * 1000
        } else {
            dateTime = new Date(time)
            let fixed = (num) => {
                if (num.toString().length === 1) {
                    return '0' + num
                }
                return num
            }
            return `${dateTime.getFullYear()}-${fixed(dateTime.getMonth() + 1)}-${fixed(dateTime.getDate())} ${fixed(dateTime.getHours())}:${fixed(dateTime.getMinutes())}:${fixed(dateTime.getSeconds())}`
        }
    },
    getFlowIcon(node, record=[]) { //传入节点返回对应图标
        let icon = ''
        if(node.moType === 'PDC' && node.type1 === 'Mirror') {
            icon = 'node'
        }else if(node.icon){
            icon = node.icon
        }else if(node.name && node.name.includes('Entry')) {
            icon = 'entry'
        }else if(node.name && node.name.includes('Exit')) {
            icon = 'exit'
        }else if(node.moType === 'PDF' && node.type1 === 'Mirror') {
            icon = 'mirror'
        }else if(node.type1 === 'SqlAdapter') {
            icon = 'sqlAdapter'
        }else if(node.type1 === 'Reference') {
            icon = 'reference'
        }else {
            icon = 'node'
        }
        if(!record.includes(icon)) {
            record.push(icon)
        }
        return icon
    },
    getIconBase64(record) {
        let icons = {}
        let nodeIcons = ['node','reference','mirror','view',...record];
        nodeIcons.forEach(item => {
        // record.forEach(item => {
            try{
                let file = path.resolve(__dirname, `../../static/images/nodes/${item}.png`)
                let icon = fs.readFileSync(file)
                icons[item] = icon.toString('base64')
            }catch(err) {}
        })
        return icons
    },
    async checkIcon(ctx, name) {
        let file = path.resolve(__dirname, `../../static/images/nodes/${name}.png`)
        if(!fs.existsSync(file)) {
            let icons = (await createRequest('UserIconMgr', 'listAllIcon').send(ctx)).CONTENT
            let index = icons.findIndex(i => i.iconName === name)
            if(index > -1) {
                let bitmap = new Buffer(icons[index].imageData, 'base64')
                fs.writeFileSync(file, bitmap)
            }else {
                name = 'node'
            }
        }
        return name
    },
    attrsToMap(arr, keyName, valueName) { //将数组内的属性值变成键值对的形式
        let obj = {}
        arr.forEach(item => {
            obj[item[keyName]] = item[valueName]
        })
        return obj
    },
    getNodeIcon(type, status) {
        let specialTypes = ['Job', 'queue', 'HistoryJob', 'PDFJob']
        if(specialTypes.includes(type)) {
            if(status == 1 || status === 'active') {
                return nodeIcons[type + 1]
            }else {
                return nodeIcons[type + 0]
            }
        }
        return nodeIcons[type]
    },
    setLazyNode(type) {
        let notLazy = ['SDC', 'SDF', 'PDC', 'PDF', 'queue', 'SUDF', 'CDC']
        if(notLazy.includes(type)) {
            return true
        }
        return false
    },
    setHasModule(item) {
        if(item.name.includes('<ExitJob>') || item.name.includes('<EntryJob>')) {
            return true
        }
    },
    timeoutFunc(config, func) {
        config.runNow && func()
        let nowTime = new Date().getTime()
        let timePoints = config.time.split(':').map(i => parseInt(i))
        let recent = new Date().setHours(...timePoints)
        recent >= nowTime || (recent += 24 * 3600000 )
        setTimeout(() => {
            func()
            setInterval(func, config.interval * 3600000 )
        }, recent - nowTime)
    },
}