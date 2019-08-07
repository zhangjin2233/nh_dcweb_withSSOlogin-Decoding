export default {
  getFileList:{
    url: '/api/SDF/attchList',
    data: {
      flowName: 'id',
    }
  },
  removeFile:{
    Class: 'SDCMgr',
    FUNC: 'deleteAttach',
    data: {
      fileName: 'attachId',
    }
  },
  downloadFile:{
    Class: 'SDCMgr',
    FUNC: 'downloadAttach',
    data: {
      fileName: 'attachId',
    }
  },
  uploadFile:{
    action: 'DCView.callJavaUploadFunc2',
    Class: 'SDCMgr',
    FUNC: 'uploadAttach',
  },
  req: {
    getFlow: {
      url: '/api/SDF/get',
      data: {
        flowName: 'id',
      }
    },
    saveFlow: {
      url: '/api/SDF/save',
    },
  },
  dcType: 'sdc',
  nodeDbClick(e,node,Vue){ //节点双击
    VUE.$router.push({ path: this.dcType, query: {
      id: node.id,
      link: node.id,
      label: node.title,
      type: this.dcType,
      flowName: this.flowName,
      from: JSON.stringify(Vue.$route.query),
    }});
  }
}