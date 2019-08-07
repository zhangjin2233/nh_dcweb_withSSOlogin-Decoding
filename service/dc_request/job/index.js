const Class = 'JobMgr'
const statusMaps = require('./statusMaps.js')
const pdcStatusMaps = require('./PDCStatusMaps.js')
let statusIndex = utils.attrsToMap(pdcStatusMaps, 'status', 'index')
let indexStatus = utils.attrsToMap(pdcStatusMaps, 'index', 'status')
let indexLabel = utils.attrsToMap(pdcStatusMaps, 'index', 'label')
module.exports = {
  async getLog0(ctx,query){ //查看日志，使用单个使用的格式
    query = query || ctx.reqData;
    let res = await createRequest(Class,'getPDCRuntimeInfo',{jobId:query.jobId,pdcJobName:query.pdcName}).send(ctx);
    let data = {
      title: res.CONTENT.Msg,
      isError: !!res.CONTENT["Error Detail"],
      tabsData: [{title:"Trace日志",value:"Trace"},{title:"错误堆栈",value:"Error Detail"}].map(item=>{
        return {
          CONTENT: {
            "title": item.title,
            "type": "String",
            "value": res.CONTENT[item.value],
          }
        }
      })
    }
    if(!res.CONTENT["Error Detail"]){
      data.tabsData.splice(1,1);
    }else if(res.CONTENT["Error Detail"] && !res.CONTENT["Trace"]){
      data.tabsData.splice(0,1);
    }
    return dataTool.resJsonPackage(data);
  },
  async getLog(ctx,query){ //查看日志,适用于DC详情的格式
    query = query || ctx.reqData;
    let res = await createRequest(Class,'getPDCRuntimeInfo',{jobId:query.jobId,pdcJobName:query.pdcName}).send(ctx);
    let tab = {
      "title": "运行日志",
      "type": "Tabs",
    }
    try{
      tab.subTabs = [{title:"Trace",value:"Trace"},{title:"错误信息",value:"Error Detail"}].map(item=>{
        return {
          "title": item.title,
          "type": "String",
          "value": res.CONTENT[item.value],
        }
      })
    }catch(err){
      tab.subTabs = [{title:"Trace",value:"无数据"},{title:"错误信息",value:"无数据"}].map(item=>{
        return {
          "title": item.title,
          "type": "String",
          "value": item.value,
        }
      })
    }
    return dataTool.resJsonPackage(tab);
  },
  async getBatchOperateFlowData(ctx,query){ //获取批量增删PDC关系的流图
    const flowData = {
      nodes: {},
      links: [],
      groups: []
    }
    return dataTool.resJsonPackage(flowData);
  },
  async flowContext(ctx) {
    let id = ctx.reqData.id
    let job 
    if(ctx.reqData.type === 'historyJob') {
      job = (await createRequest(Class, 'getHistoryJob', { historyJobId: id}).send(ctx)).CONTENT
    }else {
      job = (await createRequest(Class, 'getJob', { jobID: id }).send(ctx)).CONTENT
    }
    let tableData = job.flowContext
    let tableHead = Table.createHeads(['k', '键'], ['v', '值'])
    tableData = tableData.map(item => {
      for(key in item) {
        if(typeof item[key] === 'object') {
          item[key] = JSON.stringify(item[key])
        }
      }
      
      return item
    })
    return { tableData, tableHead }
  },
  async updateFlowContext(ctx) {
    let body = ctx.reqData
    let id = ctx.reqData.jobId
    let job
    if(body.type === 'historyJob') {
      job = (await createRequest(Class, 'getHistoryJob', { historyJobId: id }).send(ctx)).CONTENT
    }else {
      job = (await createRequest(Class, 'getJob', { jobID: id }).send(ctx)).CONTENT
    }
    let flowContext = body.tableData
    flowContext = flowContext.map(item => {
      try{
        item.v = JSON.parse(item.v)
      }catch(err) {}
      return item
    })
    job.flowContext = flowContext
    await createRequest(Class, 'updateJob', {job}, 'POST').send(ctx)
    return 'OK'
  },
  async detail(ctx) { //获取单个job数据
    let data = null
    if (ctx.reqData.id) {
      if(ctx.reqData.type === 'historyJob') {
        data = (await createRequest(Class, 'getHistoryJob', { historyJobId: ctx.reqData.id}).send(ctx)).CONTENT
      }else {
        data = (await createRequest(Class, 'getJob', { jobID: ctx.reqData.id }).send(ctx)).CONTENT
      }
    } else {
      data = (await createRequest(Class, 'newJob').send(ctx)).CONTENT
    }
    data.timeRules ||  (data.timeRules = {})
    let formData = { 
      keepHisHours: data.keepHisHours, 
      name: data.name, 
      timeRules: data.timeRules 
    }
    let tableData = data.flowContext ? data.flowContext : []
    tableData = tableData.map(item => {
      for(key in item) {
        if(typeof item[key] === 'object') {
          item[key] = JSON.stringify(item[key])
        }
      }
      return item
    })
    let index = tableData.findIndex(t => t.k === 'isAdvanced')
    if(index > -1)  {
      formData.isAdvanced = (tableData[index].v === 'yes' ? true : false)
    }else {
      formData.isAdvanced = false
    }
    let tableHead = Table.createHeads(['k', '键'], ['v', '值'])
    formData.flowContext = { tableData, tableHead }
    formData.frequency = {value: '1', key: 'Year'}
    formData.endTime = ''
    formData.startTime = ''
    let timeRules = data.timeRules
    if (timeRules.ruleType === 'and' && timeRules.childRules.length > 0) {
      timeRules.childRules.forEach(item => {
        if (item.ruleType === 'schedule') {
          formData.timePoint = item
          let frequency = {}
          for(let key in item) {
            if(item[key].includes('/')) {
              frequency.value = item[key].slice(1)
              frequency.key = key
              break
            }
          }
          formData.frequency = frequency
        } else if (item.ruleType === 'timePointRule' && item.operator == '5') {
          item.stdTime = utils.formatTime(item.stdTime)
          formData.endTime = item.stdTime
        } else if (item.ruleType === 'timePointRule' && item.operator == '2' ) {
          item.stdTime = utils.formatTime(item.stdTime)
          formData.startTime = item.stdTime
        }
      })
    }
    return formData
  },
  async create(ctx) {
    let body = ctx.reqData
    let data = (await createRequest(Class, 'newJob').send(ctx)).CONTENT
    data.flowContext = body.flowContext.tableData
    data.name = body.name
    data.keepHisHours = body.keepHisHours
    if(body.isAdvanced) {
      data.flowContext.push({k: 'isAdvanced', v: 'yes'})
      data.timeRules = body.timeRules
    }else {
      data.flowContext.push({ k: 'isAdvanced', v: 'no'})
      let childRules = []
      if(body.startTime) {
        childRules.push({
          ruleType: 'timePointRule',
          stdTime: utils.formatTime(body.startTime),
          isIgnoreDate: false,
          operator: 2
        })
      }
      if(body.endTime) {
        childRules.push({
          ruleType: 'timePointRule',
          stdTime: utils.formatTime(body.endTime),
          isIgnoreDate: false,
          operator: 5
        })
      }
      let setTimePoint = (frequency) => {
        let timeArr = {
          Year: ['Month', 'Day', 'Hour', 'Min'],
          Month: ['Day', 'Hour', 'Min'],
          Day: ['Hour', 'Min'],
          DayOfWeek: ['Hour', 'Min'],
          Hour: ['Min'],
          Min: []
        }
        let timeObj = {
          ruleType: 'schedule',
          Year: '',
          Month: '',
          Day: '',
          DayOfWeek: '',
          Hour: '',
          Min: ''
        }
        timeArr[frequency.key].forEach(item => {
          timeObj[item] = body.timePoint[item]
        })
        timeObj[frequency.key] = '/' + frequency.value
        return timeObj
      }
      childRules.push(setTimePoint(body.frequency))
      if(childRules.length === 1) { 
        data.timeRules = childRules[0]
      } else {
        data.timeRules = {
          ruleType: 'and',
          childRules: childRules
        }
      }
    }
    let story = (await createRequest('StoryMgr', 'getStory', { storyId: body.storyId}).send(ctx)).CONTENT
    let job = (await createRequest(Class, 'createJob', { story: story, job: data }, 'POST').send(ctx)).CONTENT
    if(body.catalogId) {
      let catalog = await createRequest('CatalogMgr', 'getCatalogByRealMoId', { nodeType: 'Job', realMoId: job.ID }, 'GET', 'jobNode')
            .and(createRequest('CatalogMgr', 'getCatalog', { catalogId: body.catalogId }, 'GET', 'parentNode')).coSend(ctx)
      await createRequest('CatalogMgr', 'moveCatalog', { nodeType: 'Job', catalog: catalog.jobNode.CONTENT, targetCatalog: catalog.parentNode.CONTENT }).send(ctx)
    }
     
    return 'OK'
  },
  async update(ctx) {
    let body = ctx.reqData
    let data
    if(body.type === 'historyJob') {
      let mainJob = (await createRequest(Class, 'getJob', { jobID: body.parentId }).send(ctx)).CONTENT
      data = (await createRequest(Class, 'getHistoryJobByName', { mainJob, historyJobName: body.oldName}, 'POST').send(ctx)).CONTENT
    }else {
      data = (await createRequest(Class, 'getJobByName', { jobName: body.oldName }).send(ctx)).CONTENT
    }
    data.flowContext = body.flowContext.tableData
    data.name = body.name
    data.keepHisHours = body.keepHisHours
    let index = data.flowContext.findIndex(f => f.k === 'isAdvanced')
    if (body.isAdvanced) {
      if(index > -1)  {
        data.flowContext[index].v = 'yes'
      }
      data.timeRules = body.timeRules
    } else {
      if(index > -1) {
        data.flowContext[index].v = 'no'
      } 
      let childRules = []
      if (body.startTime) {
        childRules.push({
          ruleType: 'timePointRule',
          stdTime: utils.formatTime(body.startTime),
          isIgnoreDate: false,
          operator: 2
        })
      }
      if (body.endTime) {
        childRules.push({
          ruleType: 'timePointRule',
          stdTime: utils.formatTime(body.endTime),
          isIgnoreDate: false,
          operator: 5
        })
      }
      let setTimePoint = (frequency) => {
        let timeArr = {
          Year: ['Month', 'Day', 'Hour', 'Min'],
          Month: ['Day', 'Hour', 'Min'],
          Day: ['Hour', 'Min'],
          DayOfWeek: ['Hour', 'Min'],
          Hour: ['Min'],
          Min: []
        }
        let timeObj = {
          ruleType: 'schedule',
          Year: '',
          Month: '',
          Day: '',
          DayOfWeek: '',
          Hour: '',
          Min: ''
        }
        timeArr[frequency.key].forEach(item => {
          timeObj[item] = body.timePoint[item]
        })
        timeObj[frequency.key] = '/' + frequency.value
        return timeObj
      }
      childRules.push(setTimePoint(body.frequency))
      if (childRules.length === 1) {
        data.timeRules = childRules[0]
      } else {
        data.timeRules = {
          ruleType: 'and',
          childRules: childRules
        }
      }
    }
    await createRequest(Class, 'updateJob', { job: data }, 'POST').send(ctx)
    return 'OK'
  },
  async delete(ctx) {
    await createRequest(Class, 'deleteJob', { jobName: ctx.reqData.name }).send(ctx)
    return 'OK'
  },
  async statisticsList(ctx) {
    let start = (parseInt(ctx.reqData.pageNo) - 1) * parseInt(ctx.reqData.pageSize)
    let keyword = ctx.reqData.keyword + '' || ''
    let res = await createRequest(Class, 'listAllJobStastic', { nameFilter: keyword, start: start, pageSize: parseInt(ctx.reqData.pageSize)}).send(ctx)
    let tableData = res.CONTENT.datas.map(item => {
      let obj = {
        opTime: utils.formatTime(parseInt(item.left.opTime)),
        appOpTime: utils.formatTime(parseInt(item.left.appOpTime)),
        name: item.left.name,
        storyId: item.left.storyId,
        status: item.left.Status === 'suspend' ? false : true,
        jobId: item.left.ID
      }
      obj = Object.assign(obj, item.right) 
      return obj
    })
    let status = ['Checking Condition', 'Pooling', 'Running', 'Suspend', 'Run Failed', 'Terminated', 'Ignore Fail', 'Run OK', 'Waiting', 'Total']
    status = status.map(item => [item, statusMaps[item]] )
    let items = [['name', '调度流'], ['appOpTime', '调度时间'], ['opTime', '数据时间'], ['status', '状态']]
    items.push(...status)
    let tableHead = Table.createHeads(...items)
    return { total: res.CONTENT.totalCount, tableData, tableHead }
  },
  async opTimeAxis(ctx) {
    let body = ctx.reqData
    let timeRule = body.timeRule
    let opTimeMills = body.opTimeMills ? utils.formatTime(body.opTimeMills) : new Date().getTime()
    let res = await createRequest(Class, 'calcOpTimeAxis', {
      timeRule, opTimeMills, size: 11, timeOutMills: 5000
    }, 'POST').send(ctx)
    let data = res.CONTENT.left.map(item => utils.formatTime(item))
    data.push('----参考时间----')
    data.push(...res.CONTENT.right.map(item => utils.formatTime(item)))
    return data
  },
  async PDFStatisticsList(ctx) {
    let keyword = ctx.reqData.keyword || ''
    let data = (await createRequest(Class, 'pagingPDFStasticOfJob', { sNameFilter: keyword, startPos: 0, jobId: ctx.reqData.jobId, iPageSize: 25 }).send(ctx)).CONTENT
    let tableData = data.datas.map(item => {
      let index = pdcStatusMaps.findIndex(p => p.index === item.right.PDF_CMB_STATUS)
      delete item.right.PDF_CMB_STATUS
      let obj = {
        name: item.left,
        status: pdcStatusMaps[index].label
      }
      return Object.assign(obj, item.right)
    })
    let heads = [['name', 'PDF Name'], ['status', '状态']]
    let status = Object.keys(statusMaps).map(item => {
      return [item, statusMaps[item]]
    })
    heads.push(...status)
    let tableHead = Table.createHeads(...heads)
    return { total: data.totalCount, tableData, tableHead }
  },
  async PDCRunInfo(ctx, isHistory) {
    let body = ctx.reqData
    let start = (body.pageNo - 1) * body.pageSize
    let order = { name: 'name', isAsc: true }
    let nvQuery = null
    let sort = [true, false]
    if (body.order) {
      order = {
        name: body.order,
        isAsc: sort[body.sort]
      }
    }
    if(body.agents) {
      nvQuery = {
        type: 'in',
        name: 'agent',
        value: body.agents
      }
    }
    let param = {
      jobId: body.jobId,
      iCmbStatus: body.iCmbStatus || 1,
      sNameFilter: body.keyword || '',
      queueNames: body.queueNames || null,
      cdcNames: body.cdcNames || null,
      nvQuery: nvQuery,
      order: order,
      startPos: start,
      iPageSize: body.pageSize
    }
    let tableHead = Table.createHeads([isHistory ? 'Name' : 'JobName', '名称'], ['Queue', '队列'], ['Priority', '优先级'], ['Status', '状态'], ['Msg', '信息'], ['AppOptime', '运行时间'], ['End Time', '结束时间'], ['Time', '作业耗时'], ['Total Spend Time', '总耗时'], ['Agent', '代理程序'], ['Resource', '绑定资源（挂起时长）'])
    let data = await createRequest(Class, 'pagingPDCRunTimeInfo', param, 'POST', 'list')
          .and(createRequest('AgentMgr', 'listAgent', {}, 'GET', 'agents'))
          .and(createRequest(Class, 'listAllChildQueue', { jobId: body.jobId }, 'GET', 'queues'))
          .and(createRequest(Class, 'getJob', { jobID: body.jobId }, 'GET', 'job')).coSend(ctx)
    let agents = data.agents.CONTENT.map(item => {
      return { label: item.name, value: item.name }
    })
    let queueNames = data.queues.CONTENT.map(item => {
      return { label: item.right.name, value: item.right.name }
    })
    let list = data.list.CONTENT
    let tableData = list.datas.map(item => {
      let index = pdcStatusMaps.findIndex(p => p.index === item.Status)
      let obj = {
        Queue: item.Queue,
        Priority: item.Priority,
        Status: pdcStatusMaps[index].label,
        Msg: item.Msg,
        AppOptime: utils.formatTime(item.AppOptime),
        'End Time': utils.formatTime(item['End Time']),
        Time: item['Job Exe Time'],
        Agent: item.Agent || '未指定代理',
        Resource: item.Resource,
        'Total Spend Time': item['Total Spend Time']
      }
      !isHistory ? obj.JobName = item.JobName : obj.Name = item.JobName
      return obj
    })
    let status = pdcStatusMaps.map(item => {
      return { value: item.index, label: item.label }
    })
    let job = data.job.CONTENT
    let story = (await createRequest('StoryMgr', 'getStory', { storyId: job.storyId }).send(ctx)).CONTENT
    let cdcNames = (await createRequest('CDCMgr', 'listAllCDC', {story}).send(ctx)).CONTENT.map(item => {
      return {
        label: item.name,
        value: item.name
      }
    })
    let res = { status, tableData, tableHead, agents, queueNames, cdcNames, total: data.list.CONTENT.totalCount }
    if(isHistory) {
      res.jobOptime = utils.formatTime(parseInt(job.opTime))
      ctx.reqData.opTimeMills = utils.formatTime(new Date().getTime()) 
      res.hisOpTimeList = await this.calcHisOpTimeAxis(ctx)
      res.hisOpTimeList.unshift(res.jobOptime)
    }
    return res
    
  },
  async getPDCStatus(ctx) {
    let data = await createRequest(Class, 'getJobStastic', {jobId: ctx.reqData.jobId}, 'GET', 'states')
          .and(createRequest(Class, 'getJob', { jobID: ctx.reqData.jobId }, 'GET', 'job')).coSend(ctx)
    let states = data.states.CONTENT
    let stateArr = ['Checking Condition', 'Pooling', 'Running', 'Suspend', 'Total', 'Run Failed', 'Ignore Fail', 'Terminated', 'Run OK', 'Waiting']
    let textArr = ['暂待处理', '排队中', '正在运行', '挂起', '全部', '运行出错', '忽略', '强制终止', '运行成功', '等待中']
    states = stateArr.map((item, index) => {
      return {
        label: textArr[index],
        count: states[item],
        name: item,
        iCmbStatus: statusIndex[item]
      }
    })
    let job = data.job.CONTENT
    return { states, dateTime: utils.formatTime(parseInt(job.appOpTime)), running: job.LastRunStartTime !== '-1', }
  },
  async getNodes(ctx) {
    let data = await createRequest(Class, 'listAllPDCJobNode', { jobId: ctx.reqData.jobId }, 'GET', 'nodes')
          .and(createRequest(Class, 'listAllPDCJobNameRelation', { jobId: ctx.reqData.jobId }, 'GET', 'links')).coSend(ctx)
    let nodes = data.nodes.CONTENT
    let links = data.links.CONTENT
    links = links.map(item => {
      return [item.src, item.dst]
    })
    let newNodes = {}
    for(let key in nodes) {
      let item = nodes[key]
      newNodes[item.name] = {
        id: item.name,
        guid: item.guid,
        label: item.label,
        type: item.moType.toLowerCase(),
        imgSrc: utils.getFlowIcon(item),
        hasModule: utils.setHasModule(item)
      }
    }
    return { CONTENT: {links, nodes: newNodes, groups: []} }
  },
  async getAllPDCJobStatus(ctx) {
    let status
    if(ctx.reqData.pdfId) {
      // await createRequest(Class, 'syncPDF', {jobId: ctx.reqData.jobId, pdfId: ctx.reqData.pdfId, checkReferenceNode: false})
      status = (await createRequest(Class, 'getPDFStatus', {jobId: ctx.reqData.jobId, pdfId: ctx.reqData.pdfId, ignoreView: true}).send(ctx)).CONTENT
    }else {
      status = (await createRequest(Class, 'getAllPDCJobStatus', {jobId: ctx.reqData.jobId}).send(ctx)).CONTENT
    }
    let data = {}
    for(let key in status) {
      data[key] = { status: indexStatus[status[key]] } 
    }
    return { CONTENT: { nodes: data}} 
  },
  async getHistoryData(ctx) { //获取历史数据
    return await this.PDCRunInfo(ctx, true)
  },
  async createHistoryJob(ctx) { //创建job历史分支
    let body = ctx.reqData
    let hisOpTime = utils.formatTime(body.hisOpTime)
    let mainJob = (await createRequest(Class, 'getJob', { jobID: body.jobId }).send(ctx)).CONTENT
    let hisJob = (await createRequest(Class, 'createHistoryJob', { mainJob, name: body.name, optime: hisOpTime }, 'POST').send(ctx)).CONTENT
    await createRequest(Class, 'importHistoryContent', { hisJob, pdcJobNames: body.nodes, opTime: hisOpTime }).send(ctx)
    return 'OK'
  },
  async historyJobAddNode(ctx) { //添加更多节点
    let body = ctx.reqData
    let hisJob = (await createRequest(Class, 'getHistoryJob', { historyJobId: body.jobId }).send(ctx)).CONTENT
    await createRequest(Class, 'importHistoryContent', { hisJob, pdcJobNames: body.nodes, opTime: parseInt(hisJob.opTime) }).send(ctx)
    return 'OK'
  },
  async syncPDF(ctx) {
    let body = ctx.reqData
    let pdfId = body.pdfId
    if(!pdfId) {
      pdfId = (await createRequest('PDFMgr', 'getPDFByName', {pdfName: body.pdfName}).send(ctx)).CONTENT.ID
    }
    await createRequest(Class, 'syncPDF', {jobId: body.jobId, pdfId, checkReferenceNode: true}).send(ctx)
    return 'OK'
  },
  async removePDF(ctx) {
    let body = ctx.reqData
    let pdfId = body.pdfId
    if(!pdfId) {
      pdfId = (await createRequest('PDFMgr', 'getPDFByName', {pdfName: body.pdfName}).send(ctx)).CONTENT.ID
    }
    await createRequest(Class, 'removePDF', {jobId: body.jobId, pdfId}).send(ctx)
    return 'OK'
  },
  async resetPDFAllErrors(ctx) { //重置PDF中的错误运行节点
    let body = ctx.reqData
    let pdfId = body.pdfId
    if(!pdfId) {
      pdfId = (await createRequest('PDFMgr', 'getPDFByName', {pdfName: body.pdfName}).send(ctx)).CONTENT.ID
    }
    await createRequest(Class, 'resetPDFAllErrors', {jobId: body.jobId, pdfId}).send(ctx)
    return 'OK'
  },
  async resetPDFAllStopRunnings(ctx) { //重置PDF中的所有停止运行的节点
    let body = ctx.reqData
    let pdfId = body.pdfId
    if(!pdfId) {
      pdfId = (await createRequest('PDFMgr', 'getPDFByName', {pdfName: body.pdfName}).send(ctx)).CONTENT.ID
    }
    await createRequest(Class, 'resetPDFAllStopRunnings', {jobId: body.jobId, pdfId}).send(ctx)
    return 'OK'
  },
  async changePDFAgent(ctx) {
    let body = ctx.reqData
    let pdfId = body.pdfId
    if(!pdfId) {
      pdfId = (await createRequest('PDFMgr', 'getPDFByName', {pdfName: body.pdfName}).send(ctx)).CONTENT.ID
    }
    await createRequest(Class, 'changePDFAgent', {jobId: body.jobId, pdfId, agentNames: body.agentNames}).send(ctx)
    return 'OK'
  },
  async stopPDF(ctx) {
    let body = ctx.reqData
    let pdfId = body.pdfId
    if(!pdfId) {
      pdfId = (await createRequest('PDFMgr', 'getPDFByName', {pdfName: body.pdfName}).send(ctx)).CONTENT.ID
    }
    await createRequest(Class, 'stopPDF', {jobId: body.jobId, pdfId, lTimeOut: 0}).send(ctx)
    return 'OK'
  },
  async getPDCRuntimeInfo(ctx) {
    let body = ctx.reqData
    return await createRequest(Class, 'getPDCRuntimeInfo', {jobId: body.jobId, pdcJobName: body.pdcJobName}).send(ctx)
  },
  async PDCRunHistory(ctx) {
    let body = ctx.reqData
    let pageNo = (parseInt(body.pageNo) - 1 ) * parseInt(body.pageSize)
    let data = (await createRequest(Class, 'pagingPDCRunHistory', { jobId: body.jobId, pdcJobName: body.pdcJobName, startPos: pageNo, size: parseInt(body.pageSize) }).send(ctx)).CONTENT
    let total = data.totalCount
    let tableData = data.datas.map(item => {
      return {
        Status: indexLabel[item.Status],
        Msg: item.Msg,
        Trace: item.Trace,
        AppOptime: utils.formatTime(item.AppOptime),
        'In Base Time': utils.formatTime(item['In Base Time']),
        JobName: item.JobName,
        'Start Time': utils.formatTime(item['Start Time']),
        OpTime: utils.formatTime(item.OpTime),
        'Error Detail': item['Error Detail'],
        'End Time': utils.formatTime(item['End Time'])
      }
    })
    let tableHead = Table.createHeads(['OpTime', '调度时间'], ['AppOptime', '数据时间'], ['Status', '状态'], ['Msg', '信息'], ['Start Time', '运行时间'], ['End Time', '结束时间'], ['In Base Time', '入库时间'])
    return {tableData, tableHead, total}
  },
  async calcHisOpTimeAxis(ctx) { //获取历史时间
    let body = ctx.reqData
    let list = (await createRequest(Class, 'calcHisOpTimeAxis', { jobId: body.jobId, opTimeMills: utils.formatTime(body.opTimeMills), size: 10, timeOutMills: 20000 }).send(ctx)).CONTENT
    return list.map(item => utils.formatTime(item))
  },
  async PDCAgentRunLog(ctx) {
    let body = ctx.reqData
    // let pageNo = (parseInt(body.pageNo) - 1 ) * parseInt(body.pageSize)
    let data = (await createRequest(Class, 'pagingPDCAgentRunLog', { jobId: body.jobId, pdcJobNames: [body.pdcJobName], startPos: 0, size: 25 }).send(ctx)).CONTENT
    // let total = data.totalCount
    let tableData = data.datas.map(item => {
      item.Status = indexLabel[item['Server Status']]
      return item
    })
    let tableHead = Table.createHeads(['Name', '名称'], ['Status', '服务端状态'], ['Server Time', '服务端时间'], ['Agent Trace', '执行记录'], ['Agent', '代理程序'], ['Worker', '工作进程'], ['OpTime', '调度时间'], ['Log Time', '日志时间'])
    return {tableData, tableHead, total: 0}
  },
  async createPDFJob(ctx) {
    let body = ctx.reqData
    let pdf = (await createRequest('PDFMgr', 'getPDF', { pdfId: body.pdfId }).send(ctx)).CONTENT
    let data = {
      flowContext: body.flowContext.tableData,
      jobName: body.name,
      keepHistoryHours: body.keepHisHours && parseInt(body.keepHisHours),
      pdf,
      optime: new Date().getTime(),
      appOptimeScript: '',
    }
    if(body.isAdvanced) {
      data.flowContext.push({k: 'isAdvanced', v: 'yes'})
      data.timeRule = body.timeRules
    }else {
      data.flowContext.push({ k: 'isAdvanced', v: 'no'})
      let childRules = []
      if(body.startTime) {
        childRules.push({
          ruleType: 'timePointRule',
          stdTime: utils.formatTime(body.startTime),
          isIgnoreDate: false,
          operator: 2
        })
      }
      if(body.endTime) {
        childRules.push({
          ruleType: 'timePointRule',
          stdTime: utils.formatTime(body.endTime),
          isIgnoreDate: false,
          operator: 5
        })
      }
      let setTimePoint = (frequency) => {
        let timeArr = {
          Year: ['Month', 'Day', 'Hour', 'Min'],
          Month: ['Day', 'Hour', 'Min'],
          Day: ['Hour', 'Min'],
          DayOfWeek: ['Hour', 'Min'],
          Hour: ['Min'],
          Min: []
        }
        let timeObj = {
          ruleType: 'schedule',
          Year: '',
          Month: '',
          Day: '',
          DayOfWeek: '',
          Hour: '',
          Min: ''
        }
        timeArr[frequency.key].forEach(item => {
          timeObj[item] = body.timePoint[item]
        })
        timeObj[frequency.key] = '/' + frequency.value
        return timeObj
      }
      childRules.push(setTimePoint(body.frequency))
      if(childRules.length === 1) { 
        data.timeRule = childRules[0]
      } else {
        data.timeRule = {
          ruleType: 'and',
          childRules: childRules
        }
      }
    }
    let job = (await createRequest(Class, 'createPDFJob', data, 'POST').send(ctx)).CONTENT
    if(body.catalogId) {
      let catalog = await createRequest('CatalogMgr', 'getCatalogByRealMoId', { nodeType: 'PDFJob', realMoId: job.ID }, 'GET', 'jobNode')
            .and(createRequest('CatalogMgr', 'getCatalog', { catalogId: body.catalogId }, 'GET', 'parentNode')).coSend(ctx)
      await createRequest('CatalogMgr', 'moveCatalog', { nodeType: 'PDFJob', catalog: catalog.jobNode.CONTENT, targetCatalog: catalog.parentNode.CONTENT }).send(ctx)
    }
    return 'OK'
  },
  async getDependFlow(ctx,query) {
    query = query || ctx.reqData;
    let flows = (await this.getNodes(ctx)).CONTENT
    let type = query.type
    let id = query.id
    let links = flows.links
    let nodes = flows.nodes
    let getNodes = (nodes, arr) => {
      let newNodes = {}
      arr.forEach(item => {
        item.forEach(i => {
          if(!newNodes[i]) {
            newNodes[i] = nodes[i]
          }
        })
      })
      return newNodes
    }
    if(type === 'source') {
      let getRation = (id, arr) => {
        arr = arr.filter((item) => {
          return item[1] === id
        })
        return arr
      }
      links = getRation(id, links)
    }else if(type === 'allSource') {
      let getRation = (id, arr) => {
        let newArr = []
        arr = arr.filter((item) => {
          if(item[1] === id) {
            return true
          }else {
            newArr.push(item)
            return false
          }
        })
        if(newArr.length > 0) {
          let arr0 = []
          arr.forEach(item => {
            arr0.push(...getRation(item[0], newArr))
          })
          arr.push(...arr0)
        }
        return arr
      }
      links = getRation(id, links)
    }else if(type === 'target') {
      let getRation = (id, arr) => {
        arr = arr.filter((item) => {
          return item[0] === id
            
        })
        return arr
      }
      links = getRation(id, links)
    }else if(type === 'allTarget') {
       let getRation = (id, arr) => {
        let newArr = []
        arr = arr.filter((item) => {
          if(item[0] === id) {
            return true
          }else {
            newArr.push(item)
            return false
          }
        })
        if(newArr.length > 0) {
          let arr0 = []
          arr.forEach(item => {
            arr0.push(...getRation(item[1], newArr))
          })
          arr.push(...arr0)
        }
        return arr
      }
      links = getRation(id, links)
    }else if(type === 'targetAndSource'){
      links = links.filter(item => item.includes(id));
    }else {
      throw new Error('type is not exist')
    }
    //旧数据填充
    try{
      links = [...new Set([...links,...query.flowData.links])];
    }catch(e){}
    nodes = getNodes(nodes, links)
    return dataTool.resJsonPackage({ nodes, links, groups: []});
  },
  async getDataFlowModel(ctx) {
    let body = ctx.reqData
    ctx.reqData.name = body.pdfName.endsWith('>') ? body.pdfName.slice(0, body.pdfName.lastIndexOf('<')) : body.pdfName
    return await dcModule.PDF.detail(ctx)
  },
  async listJobOfPDF(ctx) {
    let body = ctx.reqData
    let pdf = (await createRequest('PDFMgr', 'getPDF', { pdfId: body.pdfId }).send(ctx)).CONTENT
    let jobList = (await createRequest(Class, 'listPDFJob', { pdfName: pdf.guid }).send(ctx)).CONTENT
    let tableData = jobList.map(item => {
      return {
        jobTime: parseInt(item.opTime),
        poolSize: parseInt(item.MaxPoolSize),
        jobId: item.ID,
        jobName: item.name
      }
    })
    let tableHead = Table.createHeads(['jobName', 'Job 名称'])
    return {tableData, tableHead}
  },
  async addPDCs(ctx) {
    let body = ctx.reqData
    let reqs = []
    let nodes = body.nodes
    links = body.links.map(item => {
      nodes.includes(item[0]) && nodes.splice(nodes.indexOf(item[0]), 1)
      nodes.includes(item[1]) && nodes.splice(nodes.indexOf(item[1]), 1)
      item[0].includes('<MainJob>') || (item[0] += '<MainJob>')
      item[1].includes('<MainJob>') || (item[1] += '<MainJob>')
      return { key: item[0], value: item[1] }
    })
    reqs.push(createRequest(Class, 'addPDCRelations', { jobId: body.jobId, relations: links }).req(ctx))
    nodes.forEach(item => {
      item.includes('<MainJob>') || (item += '<MainJob>')
      reqs.push(createRequest(Class, 'addPDC', { jobId: body.jobId, pdcJobName: item }).req(ctx))
    })
    await Promise.all(reqs)
    return 'OK'
  }
}