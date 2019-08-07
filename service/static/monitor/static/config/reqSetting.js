export default {
  cancelSameQeq: true,//是否取消相同的请求
  timeout: 20000, //默认延时时间
  maxMsgLength: 100, //请求提示信息的最大长度
  action: 'DCView.callJavaFunc2', //请求的公共action
  uploadAction: 'DCView.callJavaUploadFunc2', //上传附件的action
  paramsKey: 'FILTER', //参数字段
  publicPath: '/ebook/dataProcess', //请求的公共路径
  loadingStyle: { //请求时的加载样式
    lock: true,
    text: 'Loading',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  },
  moduleNames: ['SDC','ADC','CDC','SDF','ADF','CDF','PDF','PDC','tree','Job','catalog'],
};