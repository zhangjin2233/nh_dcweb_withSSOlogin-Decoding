module.exports = {
    createItem(item) {
        let flag = item.flag
        if (flag === 'and' || flag === 'or') {
            return {
                type: flag,
                value: this.createFilter(item.children)
            }
        }else if(flag === '=' || flag === '<>') {
            return {
                type: flag,
                name: item.name,
                value: item.value
            }
        }else if(flag === 'like') {
            return {
                type: flag,
                isIgnoreCase: true,
                name: item.name,
                value: item.value
            }   

        }else if(flag === 'in') {
            return {
                type: flag,
                name: item.name,
                value: item.value
            } 
        }
    },
    createFilter(data) {
        return data.map(item => {
            return this.createItem(item)
        })
    },
    getFilter(data) {
        return this.createItem(data)
    }
}