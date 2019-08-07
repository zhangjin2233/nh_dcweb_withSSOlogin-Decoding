import method from './method.js'
import jobMethod from './jobMethod.js'
let getRouter = (node) => {
  VUE.$emitEvent('setMemory')
  const nodeType = node.data.type.slice(-3).toLowerCase();
  let node0 = node;
  while (node0.data.type.toLowerCase() != 'story') {
    node0 = node0.parent;
  };
  let nodeData = node.data
  nodeData.storyId = node0.data.id;
  let router = { path: nodeType, query: objClone(nodeData, {}, ['id', 'pId', 'link', 'label', 'type', 'storyId'], true) }
  let routerArr = Object.entries(router.query)
  let query = ''
  routerArr.forEach((item, index)=> {
    if(index === 0) {
      query += '?'
    } 
    query += item.join('=') + '&'
    if(index === routerArr.length - 1) {
      query = query.slice(0, -1)
    }
  })
  return '#/' + router.path + query
}
export default { //树的菜单
  Project: [method.refresh(), method.create('Story'), method.domain()],
  Story: [method.refresh(), method.rename(), method.delete(), method.export('Story'),
    {
      text: '自动化构建',
      icon: 'fa fa-gears',
      iconColor: 'blue' ,
      click(tree) {
        DCHttp.req({
          url: dcConfig.publicPath,
          params: {
            FUNC: 'executeBuildFlow',
            Class: 'StoryMgr',
            [dcConfig.paramsKey]: {
              storyName: tree.currentNode.data.label
            }
          },
          loading: true 
        })
      }
    }, method.domain()
  ],
  RequirementRoot: [ method.refresh(), method.domain()],
  DesignAndDevelopRoot: [ method.refresh(), method.domain()],
  RuntimeRoot: [ method.refresh(), method.domain()],
  SDCRoot: [ method.refresh() , method.create('SDCFolder'), {
    text: '创建SDC',
    icon: 'fa fa-plus',
    iconColor: 'green',
    click(tree) {
      const storyNode = Tree.getParentNode(tree.currentNode.data.link, "Story");
      VUE.$router.push({ 
        path: tree.currentNode.data.type.slice(0,3).toLowerCase(), 
        query: objClone(tree.currentNode.data,{storyId:storyNode.data.link},['id','pId','link','label','type'],true) 
      });
    }
  },  method.domain()],
  SDFRoot: [method.refresh(), method.create('SDFFolder'), method.create('SDF'), method.domain()],
  ADCRoot: [method.refresh(), method.create('ADCFolder'), {
      text: '创建ADC',
      icon: 'fa fa-plus',
      iconColor: 'green',
      click(tree) {
        const storyNode = Tree.getParentNode(tree.currentNode.data.link, "Story");
        VUE.$router.push({ 
          path: tree.currentNode.data.type.slice(0,3).toLowerCase(), 
          query: objClone(tree.currentNode.data,{storyId:storyNode.data.link},['id','pId','link','label','type'],true) 
        }); 
      }
  }, method.domain()],
  ADFRoot:  [method.refresh(), method.create('ADFFolder'), method.create('ADF'), method.domain()],
  PDFJobRoot: [method.refresh(), method.create('PDFJobFolder'), jobMethod.createPDFJob('root'), method.domain()],
  JobRoot: [method.refresh(), method.create('JobFolder'), method.editJob('create'), method.domain()],
  SDCFolder: [method.refresh(), method.rename(), method.delete(), method.create('SDCFolder'), {
      text: '创建SDC',
      icon: 'fa fa-plus',
      iconColor: 'green',
      click(tree) {
        const storyNode = Tree.getParentNode(tree.currentNode.data.link, "Story");
        VUE.$router.push({ 
          path: tree.currentNode.data.type.slice(0,3).toLowerCase(), 
          query: objClone(tree.currentNode.data,{storyId:storyNode.data.link},['id','pId','link','label','type'],true) 
        });
      }
  }, method.domain()],
  SDC: [
    method.refresh(), method.move(), method.delete(), method.export('SDC'), 
    {
      text: '新页面打开',
      icon: 'fa fa-files-o',
      iconColor: 'blue',
      click(tree) {
        VUE.$openPage(getRouter(tree.currentNode, tree))
      }
    }, method.domain()
  ],
  SDFFolder: [method.refresh(), method.rename(), method.delete(), method.create('SDFFolder'), method.create('SDF'), method.domain()],
  SDF: [
    method.refresh(), method.move(), method.rename(), method.delete(),  method.export('SDF'), 
    {
      text: '新页面打开',
      icon: 'fa fa-refresh',
      iconColor: 'blue',
      click(tree) {
        VUE.$openPage(getRouter(tree.currentNode))
      }
    }, method.domain()
  ],
  ADCFolder: [method.refresh(), method.rename(), method.delete(), method.create('SDCFolder'), {
      text: '创建ADC',
      icon: 'fa fa-plus',
      iconColor: 'green',
      click(tree) {
        const storyNode = Tree.getParentNode(tree.currentNode.data.link, "Story");
        VUE.$router.push({ 
          path: tree.currentNode.data.type.slice(0,3).toLowerCase(), 
          query: objClone(tree.currentNode.data,{storyId:storyNode.data.link},['id','pId','link','label','type'],true) 
        });
      }
  }, method.domain()],
  ADC: [method.refresh(), method.move(), method.delete(), method.export('ADC'), method.create('CDCFolder'), {
      text: '创建CDC',
      icon: 'fa fa-plus',
      iconColor: 'green',
      click(tree) {
        const storyNode = Tree.getParentNode(tree.currentNode.data.link, "Story");
        VUE.$router.push({ 
          path: '/cdcForm', 
          query: objClone(tree.currentNode.data,{adcId:tree.currentNode.data.link,storyId:storyNode.data.link},['id','pId','link','label','type'],true)  
        });
      }
      }, {
        text: '新页面打开',
        icon: 'fa fa-files-o',
        iconColor: 'blue',
        click(tree) {
          VUE.$openPage(getRouter(tree.currentNode))
        }
  }, method.domain()],
  CDCFolder: [method.refresh(), method.rename(), method.delete(), method.create('CDCFolder'), {
      text: '创建CDC',
      icon: 'fa fa-plus',
      iconColor: 'green',
      click(tree) {
        const storyNode = Tree.getParentNode(tree.currentNode.data.link, "Story");
        const adcNode = Tree.getParentNode(tree.currentNode.data.link, "ADC");
        VUE.$router.push({ 
          path: '/cdcForm', 
          query: objClone(tree.currentNode.data,{adcId:adcNode.data.link,storyId:storyNode.data.link},['id','pId','link','label','type'],true) 
        });
      }
  }, method.domain()],
  CDC: [method.refresh(), method.move(), method.delete(), method.export('CDC'), {
      text: '导出PDC',
      icon: 'fa fa-download',
      iconColor: 'blue',
      click(tree) {
        DCHttp.export({
          url: dcConfig.publicPath,
          params: {
            Class: 'PDCMgr',
            FUNC: 'exportPDC',
            nvQuery: {},
            [dcConfig.paramsKey]: {
              cdcIds: [tree.currentNode.data.link]
            }
          }
        })
      }
      }, {
        text: '新页面打开',
        icon: 'fa fa-files-o',
        iconColor: 'blue',
        click(tree) {
          VUE.$openPage(getRouter(tree.currentNode))
        }
      }, method.domain()
    ] ,
  ADFFolder: [method.refresh(), method.rename(), method.delete(), method.create('ADFFolder'), method.create('ADF'), method.domain()],
  ADF: [method.refresh(), method.move(), method.rename(), method.delete(), method.export('ADF'), method.create('CDFFolder'), method.create('CDF'), {
        text: '新页面打开',
        icon: 'fa fa-files-o',
        iconColor: 'blue',
        click(tree) {
          VUE.$openPage(getRouter(tree.currentNode))
        }
  }, method.domain()],
  CDFFolder: [method.refresh(), method.rename(), method.delete(), method.create('CDFFolder'), method.create('CDF'), method.domain()],
  CDF: [method.refresh(),  method.move(), method.rename(), method.delete(), method.export('CDF'), method.create('PDFFolder'), method.create('PDF'), method.domain()],
  PDFFolder: [method.refresh(), method.rename(), method.delete(), method.create('PDFFolder'), method.create('PDF'), method.domain()],
  PDF: [method.refresh(),  method.rename(), method.move(), method.delete(), method.export('PDF'), {
        text: '新页面打开',
        icon: 'fa fa-files-o',
        iconColor: 'blue',
        click(tree) {
          VUE.$openPage(getRouter(tree.currentNode))
        }
  }, method.domain()],
  PDFJobFolder: [method.refresh(), method.rename(), method.delete(), method.create('PDFJobFolder'), jobMethod.createPDFJob('folder'), method.domain()],
  PDFJob: [{
    text: '目录操作',
    children: [
      method.refresh(), method.move(), method.delete(),
      {
        text: '新页面打开',
        icon: 'fa fa-files-o',
        iconColor: 'blue',
        click(tree) {
          VUE.$openPage(getRouter(tree.currentNode))
        }
      }
    ]
  },{
    text: '运行相关',
    children: [
      jobMethod.active(), jobMethod.stop(), jobMethod.start(),
      jobMethod.resetError(), jobMethod.resetAll(),jobMethod.setPoolSize(),
      jobMethod.editParamContext(), method.editJob('update', 'Job'), 
    ]
  },{
    text: 'Job操作',
    children: [
      method.create('queue'), method.create('queueGroup'), jobMethod.createHistoryBranch(),
      {
        text: '批量增删PDC作业关联关系',
        icon: 'fa fa-folder-o',
        iconColor: '#ff8936',
        click(tree) {
          const storyNode = Tree.getParentNode(tree.currentNode.data.link, "Story");
          VUE.$router.push({ 
            path: '/batchOperate', 
            query: objClone(tree.currentNode.data,{storyId:storyNode.data.link},['id','pId','link','label','type'],true) 
          });     
        }
      },
    ]
  },{
    text: '调度信息',
    children: [{
      text: '指定调度中心',
      icon: 'el-icon-loading',
      iconColor: 'blue',
      click() {
        this.icon==='el-icon-loading' && VUE.$alert('数据刷新中请稍等片刻');
      }
    },{
      text: '查看PDF状态列表',
      icon: 'fa fa-eye',
      iconColor: 'green',
      click(tree) {
        let node = tree.currentNode;
        tree.currentNode.data.storyId = tree.getParentNode(node, 'Story').data.link;
        VUE.$openDialog(new dc.Dialog({
          top: '40px',
          title: tree.currentNode.data.label,
          width: '1100px',
          component: 'pdfStatus',
          data: tree.currentNode.data
        }))
      } 
    }],
  }, method.domain()],
  JobFolder: [method.refresh(), method.rename(), method.delete(), method.create('JobFolder'), method.editJob('create', 'folder'), method.domain()],
  Job: [{
    text: '目录操作',
    children: [
      method.refresh(), method.move(), method.delete(),
      {
        text: '新页面打开',
        icon: 'fa fa-files-o',
        iconColor: 'blue',
        click(tree) {
          VUE.$openPage(getRouter(tree.currentNode))
        }
      }, method.domain()
    ]
  },{
    text: '运行相关',
    children: [
      jobMethod.active(), jobMethod.stop(), jobMethod.start(),
      jobMethod.resetError(), jobMethod.resetAll(),jobMethod.setPoolSize(),
      jobMethod.editParamContext(), method.editJob('update', 'Job'), 
    ]
  },{
    text: 'Job操作',
    children: [
      method.create('queue'), method.create('queueGroup'),
      jobMethod.addPDF(), jobMethod.createHistoryBranch(),
      {
        text: '批量增删PDC作业关联关系',
        icon: 'fa fa-folder-o',
        iconColor: '#ff8936',
        click(tree) {
          const storyNode = Tree.getParentNode(tree.currentNode.data.link, "Story");
          VUE.$router.push({ 
            path: '/batchOperate', 
            query: objClone(tree.currentNode.data,{storyId:storyNode.data.link},['id','pId','link','label','type'],true) 
          });     
        }
      },
    ]
  },{
    text: '调度信息',
    children: [{
      text: '指定调度中心',
      icon: 'fa fa-hand-o-right',
      iconColor: 'blue',
      click() {
        this.icon==='el-icon-loading' && VUE.$alert('数据刷新中请稍等片刻');
      }
    },{
      text: '查看PDF状态列表',
      icon: 'fa fa-eye',
      iconColor: 'green',
      click(tree) {
        let node = tree.currentNode;
        tree.currentNode.data.storyId = tree.getParentNode(node, 'Story').data.link;
        VUE.$openDialog(new dc.Dialog({
          top: '40px',
          title: tree.currentNode.data.label,
          width: '1100px',
          component: 'pdfStatus',
          data: tree.currentNode.data,
        }))
      } 
    }]
  }],
  queue: [method.refresh(), jobMethod.activeQueue('激活'), jobMethod.activeQueue('挂起'), jobMethod.updateQueue(), method.delete(), method.move('移动到其它组')],
  queueGroup: [method.refresh(), method.create('queue'),  method.create('queueGroup'), method.rename(), method.delete()],
  HistoryJob: [{
    text: '目录操作',
    children: [
      method.refresh('historyjob'), method.delete(),
      {
        text: '新页面打开',
        icon: 'fa fa-files-o',
        iconColor: 'blue',
        click(tree) {
          VUE.$openPage(getRouter(tree.currentNode))
        }
      }, method.domain()
    ]
  },{
    text: '运行相关',
    children: [
      jobMethod.active(), jobMethod.stop(), jobMethod.start(),
      jobMethod.resetError(), jobMethod.resetAll(),jobMethod.setPoolSize(),
      jobMethod.editParamContext('historyJob'), method.editJob('update', 'historyJob'), 
    ]
  },{
    text: 'Job操作',
    children: [
      method.create('queue'), method.create('queueGroup'),
      {
        text: '导入更多分支节点',
        icon: 'fa fa-history',
        click(tree) {
          VUE.$openDialog({
            top: '40px',
            title: tree.currentNode.data.label,
            width: '1200px',
            component: 'historyBranch',
            data: {  parentId:tree.currentNode.parent.data.link, jobId:tree.currentNode.data.link, type:tree.currentNode.data.type, refresh:()=>{method.refresh.click(tree)} },
            hasBtn: true,
            btnAlign: 'right',
            btnGroup: [{
              text: '确定',
              type: 'primary',
              click:(dialog, component)=>{
                component.createHistoryBranch();
              }
            }, {
              text: '取消',
              click:(dialog, component)=>{
                dialog.show = false
              }
            }]
          })   
        } 
      }
    ]
  }, {
    text: '调度信息',
    children: [{
      text: '指定调度中心',
      icon: 'fa fa-hand-o-right',
      iconColor: 'blue',
      click() {
        this.icon === 'el-icon-loading' && VUE.$alert('数据刷新中请稍等片刻');
      }
    }, {
      text: '查看PDF状态列表',
      icon: 'fa fa-eye',
      iconColor: 'green',
      click(tree) {
        let node = tree.currentNode;
        tree.currentNode.data.storyId = tree.getParentNode(node, 'Story').data.link;
        VUE.$openDialog(new dc.Dialog({
          top: '40px',
          title: tree.currentNode.data.label,
          width: '1100px',
          component: 'pdfStatus',
          data: tree.currentNode.data,
        }))
      } 
    }]
  }],
  SUDFRoot: [ method.refresh(), method.create('SUDFFolder'), method.createSUDF('root'), method.domain()],
  SUDFFolder: [method.refresh(), method.rename(), method.delete(), method.create('SUDFFolder'), method.createSUDF('folder'), method.domain()],
  SUDF: [method.refresh(), method.move(), method.delete(), method.export('SUDF'), method.domain()],
  security: [method.refresh()],
  userFolder: [method.refresh(), method.create('userFolder')],
  user: [method.refresh(),method.update('user'), method.delete()],
  roles: [method.refresh()],
  dataFieldFolder: [method.refresh(), method.create('dataField')],
  dataField: [method.refresh(), method.create('dataField'), method.update('domain'),  method.delete()]
}