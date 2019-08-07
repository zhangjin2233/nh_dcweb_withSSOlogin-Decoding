const rp = require('request-promise')
const fs = require('fs');
const ipjson = require('../../conf/config.json')
module.exports = {
    
    async loginIn(ctx) {
        let body = ctx.reqData

        // var privateKey = '';
        // var mydata=fs.readFileSync('D:\\webkey.txt');
        // privateKey = mydata.toString()
        // fs.unlink('D:\\webkey.txt',function(err){if(err)console.error(err)})

        // var textToDecipher = body.password; // Text "dataToEncrypt" encrypted using DES using CBC and PKCS5 padding with the key "someprivatekey"
        // console.log('密码为：'+textToDecipher)
        // console.log('privateKey'+privateKey)
        // var iv = new Buffer.alloc(8);
        // iv.fill(0);
        // var crypto = require('crypto');
        // var decipher = crypto.createDecipheriv('des-cbc', privateKey.substr(0,8), iv);
        // var dec = decipher.update(textToDecipher, 'base64', 'utf8');
        // dec += decipher.final('utf8');

        let option = {
            uri: `${config.address}?action=security.login&NAME=${body.name}&PASSWORD=${body.password}`
            // uri: `${config.address}?action=security.login&NAME=${body.name}&PASSWORD=`+dec
        }
        let id
        let res = await rp(option, (err, res) => {
            id = res.headers['set-cookie'][0].split(';')[0]
        })
        res = JSON.parse(res)
        if(res.STATE === 1 && res.CONTENT) {
            ctx.status = 200
            let content = res.CONTENT
            ctx.cookies.set('sessionId', id.split('=')[1], { httpOnly: false, maxAge: content.LEFT.EXPIRESESSIONTIME * 60 * 1000 })
            let data = {
                id: content.LEFT.ID,
                user: content.LEFT.NAME,
                groupId: content.LEFT.GROUP_ID,
                gender: content.LEFT.GENDER,
                notes: content.RIGHT[0] && encodeURI(content.RIGHT[0].NOTES), 
                name: content.RIGHT[0] && encodeURI(content.RIGHT[0].NAME),
                system: content.RIGHT[0] && content.RIGHT[0].SYSTEM,
            }
            ctx.cookies.set('user', JSON.stringify(data), { httpOnly: false, maxAge: content.LEFT.EXPIRESESSIONTIME * 60 * 1000 })

            //zhangj新加的代码===============================================
            var ipAddress = ipjson.origin.split(':')[0]+':'+ipjson.origin.split(':')[1]+':'+ipjson.port;
            ctx.redirect(ipAddress+"/dist/index.html#/xs")

            // ctx.redirect("http://127.0.0.1:3000/dist/index.html#/"xs)
            // ctx.redirect("http://10.251.9.20:3000/dist/index.html#/xs")
            // =============================================================
            return 'OK'
        }else if(res.STATE === 1){
            ctx.cookies.set('sessionId', id.split('=')[1], { httpOnly: false})
            ctx.status = 406
            return res
        }else {
            ctx.status = 403
            return res
        }
    },
    async loginOut(ctx) {
        ctx.cookies.set('sessionId','',{signed:false, maxAge: 0})
        ctx.status = 401
        return { msg: '退出登录成功' }
    },
    async resetPassword(ctx) {
        let body = ctx.reqData
        let sessionId
        ctx.headers.cookie.split(';').forEach(item => {
            if(item.includes('sessionId')) {
                sessionId = item.split('=')[1]
            }
        })
        let option = {
            uri: `${config.address}?action=security.modifyPassword&ID=""&NEW_PASSWORD=${body.newP}&OLD_PASSWORD=${body.p}`,
            headers: {
                Cookie: `JSESSIONID=${sessionId}`
            }
        }
        let res = JSON.parse(await rp(option))
        if(res.STATE == 1) {
            ctx.status = 200
        }else {
            ctx.status = 400
        }
        return JSON.stringify(res)
    }
}