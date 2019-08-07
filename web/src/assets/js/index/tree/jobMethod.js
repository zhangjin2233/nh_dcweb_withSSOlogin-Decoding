let Class = 'JobMgr'
let getChildren = (node) => {
  if(node.data.type === 'SUDF' || node.data.type === 'queue') {
    node = node.parent
  }
  let data = node.data
  let params = {id: data.id, type: data.type}
  node.childNodes = []
  let type = data.type.toLowerCase()
  if(type === 'job' || type === 'pdfjob' || type === 'historyjob' || type === 'queuegroup') {
    params = {
      jobId: data.jobId || data.link,
      groupPath: data.groupPath,
      type: data.type,
      showDomain: JSON.parse(sessionStorage.getItem('domain')),
    }
  }
  DCHttp.req({
    url: '/api/catalog/children', 
    params
  }).then(res => {
    data.children = res.data
  })
}
export default {
  active() {
    return {
      text: '激活/挂起',
      icon: 'fa fa-power-off',
      iconColor: '#ffa631',
      click(tree) {
        let node = tree.currentNode
        let data = node.data
        let params = {
          Class,
          [dcConfig.paramsKey]: {
            jobId: data.link
          }
        }
        if(data.active) {
          params.FUNC = 'suspendJob'
        }else {
          params.FUNC = 'activeJob'
        }
        DCHttp.req({
          url: dcConfig.publicPath,
          params
        }).then(res => {
          getChildren(node.parent)
        })
      }
    }
  },
  stop() {
    return {
      text: '中断',
      icon: 'fa fa-stop',
      iconColor: 'red',
      click(tree) {
        let node = tree.currentNode
        DCHttp.req({
          url: dcConfig.publicPath,
          params: {
            Class,
            FUNC: 'stopJob',
            [dcConfig.paramsKey]: { 
              jobId: node.data.link
            }
          }
        }).then(res => {
          getChildren(node.parent)
        })
      }
    }
  },
  start() {
    return {
      text: '启动',
      icon: 'fa fa-play',
      iconColor: 'rgb(80, 139, 55)',
      click(tree) {
        let form = new dc.Form()
        let node = tree.currentNode
        form.set({
          structure: [{
            type: 'DateTime',
            canBeEmpty: false,
            name: 'dateTime',
            label: '启动时间',
          }],
          data: {
            dateTime: '',
            jobId: tree.currentNode.data.id
          },
          btns: [{
            label: '确定',
            type: 'primary',
            click(form,btn,index){
              DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                  Class,
                  FUNC: 'startJob',
                  [dcConfig.paramsKey]: {
                    jobId: node.data.link,
                    opTime: VUE.$formatTime(form.data.dateTime + ':00','number')
                  }
                }
              }).then(res => {
                getChildren(node.parent)
                VUE.$closeDialog()
              })
            }
            }, {
              label: '取消',
              click(form,btn,index){
                VUE.$closeDialog()
              }
            }]
        })
        DCHttp.req({
          url: dcConfig.publicPath,
          params: {
            Class,
            FUNC: 'getJob',
            [dcConfig.paramsKey]: {
              jobID: node.data.link
            }
          }
        }).then(res => {
          form.data.dateTime = VUE.$formatTime(res.CONTENT.appOpTime+ ':00','number')
        })
        VUE.$openDialog({
          title: '启动Job',
          width: '400px',
          component: 'dc-form',
          data: {
            object: form
          }
        }) 
      }
    }
  },
  resetError() {
    return {
      text: '仅重置错误节点的状态',
      icon: 'fa fa-paint-brush',
      iconColor: 'orange',
      click(tree) {
        DCHttp.req({
          url: dcConfig.publicPath,
          params: {
            Class,
            FUNC: 'resetAllErrorPDCOfJob',
            [dcConfig.paramsKey]: {
              jobId: tree.currentNode.data.link
            }
          }
        }).then(res => {
          VUE.$successMessage('重置成功')
        })
      }

    }
  },
  resetAll() {
    return {
      text: '重置所有节点(包含已成功的)',
      icon: 'fa fa-warning',
      iconColor: '#b35c44',
      click(tree) {
        let str = '您确定要重置所有节点的运行状态？“甚至”包括已经运行成功的节点也要重置？'
        VUE.$affirm(str).then(() => {
          DCHttp.req({
            url: dcConfig.publicPath,
            params: {
              Class,
              FUNC: 'resetAllPDCOfJob',
              [dcConfig.paramsKey]: {
                jobId: tree.currentNode.data.link
              }
            }
          }).then(res => {
            VUE.$successMessage('重置成功')
          })
        })
      }
    }
  },
  setPoolSize() {
    return {
      text: '设置默认队列并发数',
      icon: 'fa fa-sliders',
      iconColor: '#808080',
      click(tree) {
        let form = new dc.Form()
        let node = tree.currentNode
        form.set({
          structure: [{
            type: 'string',
            canBeEmpty: false,
            name: 'poolSize',
            label: '并发数',
          }],
          data: {
            poolSize: node.data.poolSize,
          },
          btns: [{
            label: '确定',
            type: 'primary',
            click(form,btn,index){
              let params = {
                Class,
                FUNC: 'setJobPoolSize',
                [dcConfig.paramsKey]: {
                  jobId: node.data.link,
                  poolSize: parseInt(form.data.poolSize)
                }
              }
              DCHttp.req({
                url: dcConfig.publicPath,
                params
              }).then(res => {
                getChildren(node.parent)
                VUE.$closeDialog()
              })
            }
            }, {
            label: '取消',
            click(form,btn,index){
              VUE.$closeDialog()
            }
            }]
        })
        VUE.$openDialog({
          title: '设置队列并发数',
          width: '400px',
          component: 'dc-form',
          data: {
            object: form
          }
        })
      }
    }
  },
  activeQueue(type) {
    return {
      text: type,
      icon: 'fa fa-power-off',
      iconColor:  type === '激活' ? 'rgb(80, 139, 55)' : 'red',
      show(tree) {
        return true;
      },
      click(tree) {
        let node = tree.currentNode
        let jobId = node.data.jobId
        DCHttp.req({
          url: dcConfig.publicPath,
          params: {
            Class,
            FUNC: 'suspendQueue',
            [dcConfig.paramsKey]: {
              jobId,
              queueName: node.label,
              groupPath: node.data.groupPath,
              suspend: !node.data.active
            }
          }
        })
        getChildren(node)
      }
    }
  },
  updateQueue() {
    return {
      text: '修改',
      icon: 'fa fa-pencil',
      iconColor: 'blue',
      click(tree) {
        let form = new dc.Form()
        let node = tree.currentNode
        let jobId = tree.getParentNode(node, 'Job').data.link
        let parent = node.parent.data
        let data = {
          newQueueName: node.label,
          poolSize: node.data.poolSize
        }
        form.set({
          structure: [{
            type: 'string',
            readOnly: false,
            canBeEmpty: false,
            name: 'newQueueName',
            label: '名称',
          }, {
            type: 'Int', 
            readOnly: false,
            canBeEmpty: false,
            name: 'poolSize',
            label: '并发数',
          }],
          data: data,
          btns: [{
            label: '确定',
            type: 'primary',
            click(form,btn,index){
              form.data.poolSize = parseInt(form.data.poolSize)
              DCHttp.req({
                url: dcConfig.publicPath,
                params: {
                  Class,
                  FUNC: 'updateQueue',
                  [dcConfig.paramsKey]: {
                    jobId,
                    groupPath: node.data.groupPath,
                    queueName: node.label,
                    newQueueName: form.data.newQueueName,
                    poolSize: parseInt(form.data.poolSize)
                  }
                }
              }).then(res => {
                VUE.$closeDialog()
                getChildren(node.parent)
              })
            }
            }, {
            label: '取消',
            click(form,btn,index){
              VUE.$closeDialog()
            }
            }]
        })
        VUE.$openDialog({
          title: '修改执行队列',
          width: '400px',
          component: 'dc-form',
          data: {
            object: form
          }
        })  
      }
    }
  },
  editParamContext(type) {
    return {
      text: '上下文参数',
      icon: 'fa fa-file-text',
      iconColor: 'blue',
      click(tree) {
        let node = tree.currentNode
        VUE.$openDialog(new dc.Dialog({
          title: '修改上下文参数',
          width: '600px',
          component: 'jobContext',
          data: {
            jobId: node.data.link,
            type
          }
        }))  
      }
    }
  },
  createHistoryBranch() {
    return {
      text: '创建历史分支',
      icon: 'fa fa-history',
      click(tree) {
        VUE.$openDialog({
          title: tree.currentNode.data.label,
          top: '40px',
          width: '1200px',
          component: 'historyBranch',
          data: { jobId:tree.currentNode.data.link, type:tree.currentNode.data.type, refresh:()=>{refreshNode(tree, tree.currentNode)} },
          hasBtn: true,
          btnAlign: 'right',
          btnGroup: [{
            text: '确定',
            type: 'primary',
            size: 'mini',
            click:(dialog, component)=>{
              component.createHistoryBranch();
            }
            }, {
            text: '取消',
            size: 'mini',
            click(dialog, component) {
              dialog.show = false
            }
          }]
        })   
      } 
    }
  },
  addPDF() {
    return {
      text: '添加PDF',
      icon: 'fa fa-plus',
      iconColor: 'green',
      click(tree) {
        let jobId = tree.currentNode.data.link
        VUE.$openDialog(new dc.Dialog({
          title: '添加PDF',
          component: 'addPDF',
          width: '400px',
          data: {
            storyId: tree.getParentNode(jobId, 'Story').data.link,
            jobId
          }
        }))
      }
    }
  },
  createPDFJob(type) {
    return {
      text: '创建PDF更新任务',
      icon: 'fa fa-plus',
      iconColor: 'green',
      click:(tree)=>{
        let node = tree.currentNode
        let jobId = node.data.link
        VUE.$openDialog(new dc.Dialog({
          title: '添加PDF',
          component: 'addPDF',
          width: '400px',
          data: {
            storyId: tree.getParentNode(jobId, 'Story').data.link,
            jobId,
            noCheck: true,
            type: 'createPDFJob',
            tree: tree,
            node: node,
            catalogId: type === 'folder' ? node.data.id : undefined,
            refreshNode: getChildren,
          }
        }))
      }
    }
  }
}