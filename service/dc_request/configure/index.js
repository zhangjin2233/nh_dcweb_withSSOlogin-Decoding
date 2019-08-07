const fs = require('fs')
const path = require('path')
module.exports = {
    async customModuleInfo(ctx) {
        let customModule = fs.readFileSync(path.join(__dirname, '../../conf/custom_module.json'))
        return customModule
    },
    async customModuleSave(ctx) {
        let data = ctx.reqData
        try{
            fs.writeFileSync(path.join(__dirname, '../../conf/custom_module.json'), JSON.stringify(data))
        }catch(err) {
            return err
        }
        return 'OK'
    }
}