
import DCHttp from './DCHttp.json'
const importFileConfig = {
    origin: location.origin + DCHttp.ebook.publicPath, //请求的url公共部分
    name: 'attach',//文件上传的字段名
    limit: 10,//文件限制数
    multiple: true,//是否可多选
    action: DCHttp.ebook.uploadAction,//请求的action
    width: '500px',//弹窗的宽度
    accept: [],//接受的文件类型
    btnAlign: 'right',//按钮的对齐方式
    top: '15vh',//离顶部的距离
    title: '导入文件',//窗口标题
}

export default importFileConfig