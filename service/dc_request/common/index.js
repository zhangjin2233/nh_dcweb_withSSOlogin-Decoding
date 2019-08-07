const treeConfig = require('../../conf/dc_tree.json')
const pageConfig = require('../../conf/dc_page.json')
const fs = require('fs')
const path = require('path')

module.exports = {
    async getConfig() {
        let customModule = fs.readFileSync(path.join(__dirname, '../../conf/custom_module.json'))
        customModule = JSON.parse(customModule.toString())
        function getLocalIP() {
            const os = require('os');
            const ifaces = os.networkInterfaces();
            let ip = '';
            for (let dev in ifaces) {
                for (let i = 0; i < ifaces[dev].length; i++) {
                    if (!ifaces[dev][i].internal && ifaces[dev][i].family === 'IPv4' && !ifaces[dev][i].address.includes('::') && ifaces[dev][i].address !== '127.0.0.1') {
                        ip = ifaces[dev][i].address;
                        break;
                    }
                }
            }
            return ip;
        }
        return  { 
            Class: dcClass, 
            publicPath: config.publicPath, 
            port: config.port, 
            paramsKey: config.paramsKey, 
            action: config.action,
            uploadAction: config.uploadAction,
            tree: {
                fontSize: treeConfig.fontSize,
                icons: treeConfig.icons
            },
            page: pageConfig,
            customModule,
            ip: getLocalIP() || '127.0.0.1'
        }
    }
}