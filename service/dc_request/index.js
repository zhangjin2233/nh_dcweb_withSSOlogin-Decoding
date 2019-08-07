global.HttpRequest = require('./HttpRequest.js')
global.Table = require('./common/Table.js')
global.dataTool = require('./common/dataTool.js')
global.Form = require('./common/Form.js')
global.createRequest = (...params) => {
    if(params.length === 1) {
        return new HttpRequest(params[0])
    }else if(params.length > 1) {
        let obj = {
            Class: params[0],
            FUNC: params[1],
            params: params[2] ? params[2] : {},
            method: params[3] ? params[3] : 'GET',
            name: params[4] ? params[4] : '',
            ignoreError: params[5],
            option: params[6] ? params[6] : {}
        }
        return new HttpRequest(obj)
    }
}
global.getReq = async(ctx)=>{
    let query;
    return new Promise((resolve, reject) => {
        if(ctx.request.method == 'GET'){
            query = ctx.query;
            resolve(query)
        }else{
            let params = '';
            ctx.req.on('data', (data)=>{ params += data })
            ctx.req.on('end', ()=>{ 
                query = JSON.parse(params);
                resolve(query)
            })
        }
    })
}
global.advanceFilter = require('./common/advanceFilter.js')
global.utils = require('./common/utils.js')

let meta = {
    catalog: require('./catalog/index'),
    story: require('./story/index.js'),
    ADC: require('./ADC/index.js'),
    ADF: require('./ADF/index.js'),
    CDC: require('./CDC/index.js'),
    CDF: require('./CDF/index.js'),
    Job: require('./job/index.js'),
    other: require('./other/index.js'),
    PDC: require('./PDC/index.js'),
    PDF: require('./PDF/index.js'),
    SDC: require('./SDC/index.js'),
    SDF: require('./SDF/index.js'),
    DBDataSource: require('./setting/DBDataSource/index.js'),
    serverInfo: require('./setting/serverInfo/index.js'),
    propertiesTable: require('./setting/propertiesTable/index.js'),
    enumDef: require('./setting/enumDef/index.js'),
    agent: require('./setting/agent/index.js'),
    param: require('./setting/param/index.js'),
    dataset: require('./setting/dataset/index.js'),
    userIcon: require('./setting/userIcon/index.js'),
    tableEntity: require('./setting/tableEntity/index.js'),
    resourcePool: require('./setting/resourcePool/index.js'),
    backup: require('./tools/backup/index.js'),
    common: require('./common/index.js'),
    login: require('./login/index.js'),
    tree: require('./tree/index.js'),
    SUDF: require('./SUDF/index.js'),
    user: require('./security/user'),
    domain: require('./security/domain'),
    privilege: require('./security/privilege'),
    role: require('./security/role'),
    version: require('./tools/version/index.js'),
    configure: require('./configure/index.js')
}
global.dcModule = meta
let reqPost = async (ctx) => {
    let body = ''
    ctx.req.on('data', (data) => {
        body += data
    })
    return new Promise((resolve, reject) => {
        ctx.req.on('end', async () => {
           resolve(JSON.parse(body))
        })
    })
}
router.all('/api/:model/:type', async (ctx, next) => {
    try {
        let type = ctx.params.type
        let model = ctx.params.model
        if (meta[model][type] && typeof meta[model][type] === 'function') {
            if(ctx.method === 'POST') {
                ctx.reqData = await reqPost(ctx)
            }else {
                let query = ctx.query
                for(key in query) {
                    try{
                        query[key] = JSON.parse(query[key])
                    }catch(err) {}
                }
                ctx.reqData = query
            }
            let data = await meta[model][type](ctx)
            setBody(ctx, data)
        } else {
            ctx.body = '404 Not Found'
        }
    }catch(err) { 
        if(ctx.isError) {
            ctx.status === 401 || (ctx.status = 400)
        }else {
            ctx.status = 500
            ctx.body = { error: '内部错误' }
        }
        console.log(err)
    }
   
})

