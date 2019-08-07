

const SKIN_FLAG = {
  PRE: 'pre',
  NEXT: 'next',
  ALL: 'all',
}

const tableHead = [{
  label: '条件名称',
  name: 'name',
  type: 'String',
},{
  label: '条件描述',
  name: 'desc',
  type: 'text',
},{
  label: '满足时执行',
  name: 'nextAction',
  type: 'SingleEnum',
  option: []
},{
  label: '循环用条件',
  name: 'isloopCase',
  type: 'Boolean',
},{
  label: '数据',
  name: 'condition',
  type: 'dc-advFilter',
  elementType: 'dc-advFilter',
}];

export default {
  domType: 'svg', //流图渲染的dom类型 html/svg
  type: 'flowNodeWidthLinkType', //流图节点的类型-取决于组件
  statusImgSize: 5,
  emptyFlowTipShow: false,
  canNodeIntoView: false,
  listShow: true,
  toolbarComponentShow: true,
  btnGroupMember: {
    show: false,
    icon: 'fa fa-stop',
    style: "position:absolute; left: 43px",
  },
  toolbarComponent: 'timeAndTest',
  listData: [{
    title: 'SUDF',
    img: 'udffolder',
    nodes: []
  },{
    title: '动作',
    img: 'actionFolder',
    nodes: []
  },{
    title: '其他',
    icon: 'fa fa-cog',
    img: '',
    nodes: [{
      label: '分支',
      img: 'normalBranch',
      type: 'normalBranch',
    // },{
    //   label: '分支控制',
    //   img: 'branch',
    //   type: 'branch',
    },{
      label: 'SQL',
      img: 'sql',
      type: 'normalSql',
    },{
      label: 'Java',
      img: 'java',
      type: 'java'
    },{
      label: '脚本',
      img: 'script',
      type: 'script'
    }]
  }],
  getFlow: (Vue)=>{ //获取流图数据
    let emptyData = {
      "CONTENT": {
        "nodes": {},
        "groups": [],
        "links": [],
        "jumpLinks": [],
        "branchData":{}
      },
    };
    Vue.flow.getFlowFinished(Vue,emptyData);
  },
  nodeAttrs: ["id","label","type","imgSrc"],
  // nodeFlag: 'pdc',
  canRemoveLine: true,
  isContactAttach: true,
  canNodeIntoView: true,
  req: {
    getPDCList: { //获取PDC列表
      url: '/api/PDC/list',
    },
    getSourceTable: { //获取已保存的来源表
      url: '/api/PDC/getSourceTable'
    },
    saveSourceTable: { //保存配置的来源表
      url: '/api/PDC/saveSourceTable'
    },
    importDataSet:{ //作业变量配置导入
      Class: 'PDCMgr',
      FUNC: 'importDataSetContent'
    },
    exportDataSet: { //作业变量配置导出
      Class: 'PDCMgr',
      FUNC: 'exportDataSetContent'
    },
    getParamsOption:{ //获取系统变量
      url: '/api/PDC/getParamsOption'
    },
  },
  toolbar: [ //工具栏
    [{
      icon: 'fa fa-refresh',
      title: '刷新 ctrl+r',
      color: 'green',
      event:{
        click: function(){
          this.flow.refreshFlow(this);
        }
      },
    },{
      icon: 'fa fa-reply',
      title: '撤销 ctrl+z',
      color: 'blue',
      disabled: function(flow){
        return flow.recordIndex == 0
      },
      event:{
        click: function(){
          this.flow.historyUndo(this);
        }
      },
    },{
      icon: 'fa fa-share',
      title: '重做 ctrl+y',
      color: 'blue',
      disabled: function(flow){
        return flow.recordIndex == flow.recordLength
      },
      event:{
        click: function(){
          this.flow.historyRedo(this);
        }
      },
    },{
      icon: 'fa fa-align-left',
      title: '自动布局 ctrl+l',
      event:{
        click: function(){
          this.panelObj.autoLayout(this, this.nodes, this.lines);
        }
      },
    },{
      title: '切换线的粗细 ctrl+b',
      icon: 'fa fa-usb',
      event: {
        click: function(){
          this.linesObj.changeWidth(this);
        }
      },
    },{
      title: '放大 ctrl+=',
      icon: 'fa fa-search-plus',
      color: 'blue',
      event: {
        click: function(){
          this.panelObj.zoomIn(this);
        }
      },
    },{
      title: '缩小 ctrl+-',
      color: 'blue',
      icon: 'fa fa-search-minus',
      event: {
        click: function(){
          this.panelObj.zoomOut(this);
        }
      },
    },{
      title: '切换分支控制的循环链路开关',
      icon: 'fa fa-plug',
      color: 'orange',
      event: {
        click: function(){
          this.jumpLinkType = !this.jumpLinkType;
        }
      },
    },{
      title: '作业变量配置',
      icon: 'fa fa-cog',
      color: 'green',
      disabled:function(){ return true },
      event: {
        click: function(){
          if(VUE.$store.state.PDCData.data.jobParamsDef_){
            VUE.$openDialog(new dc.Dialog({
              verticalCenter: true,
              top: '40px',
              width: '900px',
              component: 'variableConfig',
            }))
          }else{
            VUE.$alert('无法设置');
          }
        }
      },
    },{
      title: '添加来源表',
      icon: 'fa fa-list-alt',
      color: 'blue',
      disabled:function(){ return true },
      event: {
        click: function(){
          VUE.$openDialog(new dc.Dialog({
            verticalCenter: true,
            top: '40px',
            width: '1000px',
            component: 'sourceTable',
          }))
        }
      },
    }]
  ],
  lineTitle(line,Vue,type){ //连线的悬浮提示
    let title = `${line[0]} → ${line[1]}`;
    if(Vue.flow.jumpLinkType.includes(Vue.nodes[line[0]].type)){
      let item = Vue.branchData[line[0]].tableData.find(item=>item.nextAction === line[1]);
      title = item ? `${item.name} ${item.desc ? (': '+item.desc) : ''}` : '未选中条件';
    }
    return title;
  },
  addJumpLink(lineStartNode,lineTargetNode,Vue){
    if(Vue.flow.isLoop(lineStartNode.id, lineTargetNode.id, objClone(Vue.lines))){ //是否会造成循环
      if(Vue.jumpLinks.some(item=>item[0] == lineStartNode.id)){
        Vue.$alert("一个分支节点只能指定一条循环跳转路径");
      }else{
        Vue.jumpLinks.push([lineStartNode.id,lineTargetNode.id]);
      }
    }else{
      Vue.$alert("该情形应当使用普通链路而非循环跳转链路连接");
    }
  },
  lineOperate(line,Vue){
    if(Vue.flow.jumpLinkType.includes(Vue.nodes[line[0]].type)){
      let tableData = Vue.branchData[line[0]].tableData; //拿到nodes[line[0]]中的所有行数据
      let tableItem = tableData.find(item=>item.nextAction == line[1]);
      let form = new dc.Form({
        structure: [{
          label: '选择条件',
          name: 'name',
          type: 'singleEnum',
          option: tableData.map(item=>{return { label:item.name, value:item.name, desc:item.desc }}), 
          change(formClass,item){
            formClass.data.desc = item.option.find(item0=>item0.value === formClass.data[item.name]).desc;
          }
        },{
          label: '条件描述',
          name: 'desc',
          readOnly: true,
        }],
        data: {
          name: tableItem ? tableItem.name : '',
          desc: tableItem ? tableItem.desc : '',
        }
      })
      Vue.$openDialog(new dc.Dialog({
        verticalCenter: true,
        component: 'dc-form',
        width: '700px',
        data: {object: form},
        hasBtn: true,
        btnGroup: [{
          text: '确定',
          type: 'primary',
          size: 'small',
          click:(dialog, component)=>{ 
            tableData.forEach(item=>{
              (item.nextAction === line[1]) && (item.nextAction = '');
              (item.name === form.data.name) && (item.nextAction = line[1])
            })
            dialog.show = false;
          }
         },{
          text: '取消',
          click(dialog, component) {
             dialog.show = false
          }
        }]
      }))
    }
  },
  async createNode(nodeData,nodeAttr,Vue){//生成一个节点
    let nodeId = await setNodeId(nodeData,Vue);
    if(nodeId && Vue.flow.jumpLinkType.includes(nodeData.type)){
      Vue.$set(Vue.branchData,nodeId,{ formData:{Describe:""},tableData:[] })
    }
    return new Promise((resolve)=>{
      resolve(objClone(nodeAttr,{
        id: nodeId,
        label: nodeData.id ? nodeData.label : nodeId,
        imgSrc: nodeData.imgSrc,
        img: nodeData.img,
        width: Vue.flow.size.node.width,
        height: Vue.flow.size.node.height,
        type: nodeData.type,
        data: getNodeData(nodeId,nodeData.type),
        status: "any",
        animate: '',
      },['id','label','width','height','imgSrc','type','data','status','img','animate']))
    })
  },
  nodeDbClick(e,node,Vue){ //节点双击
    switch(node.type){
      case 'udf':
        Vue.$store.state.PDCForm.tree.setCurrentKey(node.id);
        Vue.$store.state.PDCForm.tree.currentNode = Vue.$store.state.PDCForm.tree.data.find(item=>item.type=='SUDFFolder').children.find(item=>item.id==node.id);
        break;
      case 'branch':
        let nodesId = [];
        Vue.lines.forEach(item=>{ item[0]==node.id && nodesId.push(item[1]) })
        Vue.jumpLinks.forEach(item=>{ item[0]==node.id && nodesId.push(item[1]) });
        let option = [...(new Set(nodesId))].map(key=>{ return { value:Vue.nodes[key].id, label:Vue.nodes[key].id}});
        option.unshift({value:'', label:'暂未选择'});
        tableHead.find(item=>item.name=='nextAction').option = option;
        let dialogData = {
          tableHead: objClone(tableHead),
          reqs: [{url:Vue.flow.req.getParamsOption.url,params:{}}],
          formData: Vue.branchData[node.id].formData,
          tableData: Vue.branchData[node.id].tableData
        }
        Vue.$openDialog(new dc.Dialog({
          verticalCenter: true,
          top: '40px',
          width: '700px',
          data: objClone(dialogData),
          component: 'branchData',
          hasBtn: true,
          btnGroup: [{
            text: '确定',
            type: 'primary',
            click:(dialog, component)=>{
              let target = dialog.data.tableData.map(item=>{
                return item.nextAction
              });
              target.forEach((item,itemIndex)=>{
                if(item){
                  let arr = target.slice(itemIndex+1);
                  arr.forEach((item0,item0Index)=>{
                    (item0 === item) && (dialog.data.tableData[itemIndex+1+item0Index].nextAction = '');
                  })
                }
              })
              Vue.$set(Vue.branchData,node.id,{formData:dialog.data.formData,tableData:dialog.data.tableData});
              dialog.show = false; 
            }
           },{
            text: '取消',
            click:(dialog, component)=>{
              dialog.show = false
            }
          }]
        }))
        break;
      case 'normalSql':
      case 'sql':
        VUE.$openDialog(new dc.Dialog({
          fullscreen: true,
          component: 'sqlComponent',
          showClose: false,
          data: {
            data: node.data,
            dipName: node.label
          }
        }))
        break;
      case 'java':
        let leafFolder = Vue.$store.state.PDCData.treeList.find(leaf=>leaf.id == 'actionFolder');
        let leaf = leafFolder ? leafFolder.children.find(l=>l.id == node.id) : null;
        if(leaf){
          Vue.$store.state.PDCForm.tree.setCurrentKey(node.id);
          Vue.$store.state.PDCForm.tree.currentNode = leaf;
        }
        break;
      default:
        break;
    }
  },
  nodeRightClick(e,node,Vue){ //节点右击
    let contextmenu = [{
      text: '编辑',
      icon: 'fa fa-edit',
      iconColor: 'blue',
      click: function(){
        Vue.flow.nodeDbClick(e,node,Vue);
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: (Vue.jumpLinkType ? '关闭' : '开启')+'循环跳转链路功能',
      icon: 'fa fa-plug',
      iconColor: 'orange',
      show(){
        return Vue.flow.jumpLinkType.includes(node.type) 
      },
      click: function(){
        Vue.jumpLinkType = !Vue.jumpLinkType;
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: '删除',
      icon: 'fa fa-remove',
      iconColor: 'red',
      click: function(){
        Vue.flow.contextmenu.hideMenu();
        //如果是折叠节点，不可删除
        if(node[SKIN_FLAG.PRE] || node[SKIN_FLAG.NEXT]){
          VUE.$alert("该节点有折叠数据，请先展开节点再进行删除操作,","提示");
        }else{
          Vue.nodeObj.remove(Vue);
          if(Vue.flow.jumpLinkType.includes(node.type)){
            Object.defineProperty(Vue.branchData,node.id,{enumerable: false});
            delete Vue.branchData[node.id];
          }
        }
      }
    },{
      text: '显示亲缘节点',
      icon: 'fa fa-share-alt',
      iconColor: '#ff461f',
      show: ()=>{ return Vue.flow.getSkinship(Vue,node,SKIN_FLAG.ALL).nodes.length>1 },
      click: function(){
        Vue.nodeObj.getSkinship(Vue, SKIN_FLAG.ALL); 
        Vue.flow.contextmenu.hideMenu();
      }
    }];
    Vue.flow.contextmenu.showMenu(e,contextmenu);
  },
}

function getNodeData(id,type){
  const script = "import java.util.*;\nimport java.io.*;\nimport java.lang.*;\n//END DEFAULT IMPORT";
  const nodeClassNameMap = {
    "script": "com.leavay.dfc.mgr.etl.component.T_LJavaScript",
    "java": "com.leavay.dfc.mgr.etl.component.T_Java",
    "udf": "com.leavay.dfc.mgr.etl.component.T_FBom",
    "branch": "com.leavay.dfc.mgr.etl.component.T_BranchScriptExt", //报送分支
    "normalBranch": "com.leavay.dfc.mgr.etl.component.T_BranchScript",
    "sql": "com.leavay.dfc.mgr.etl.component.T_SqlCmpExt", //报送sql
    "normalSql": "com.leavay.dfc.mgr.etl.component.T_SqlCmp",
  };
  const sqlCmp = {
    "isShowLabel": true,
    "fieldRelations": [],
    "viewMetas": [],
    "executeType": 1,
    "variableOperations": [],
    "delConds": [],
    "delAdvSql": [],
    "delRunSql": [],
    "updateValue": [],
    "updateRelat": [],
  };
  return {
    "name": id,
    "joinType": "any",
    "nodeType": ['branch','normalBranch'].includes(type) ? "FlowBranchNode" : "FlowCtrlNode",
    "job": {
      "className": nodeClassNameMap[type],
      "name": id,
      "sourceKey": "", //暂定为空字符串
      "isSaved2JobXML": true, // 暂定为true
      "attrName": ['udf'].includes(type) ? id : undefined, //当udf类型时才有的数据
      "script": ['branch','normalBranch','script'].includes(type) ? script : "",
      "sqlCmp": ['normalSql', 'sql'].includes(type) ? objClone(sqlCmp) : undefined,
    }
  }
}

function setNodeId(node,Vue){
  let nodeId = node.id || node.label;
  let nodesId = Object.keys(Vue.nodes).map(key=>Vue.nodes[key].id);
  return new Promise((resolve)=>{
    if(node.id){
      if(nodesId.includes(node.id)){
        Vue.$alert(nodeId+'已存在');
        resolve();
      }else{
        resolve(nodeId);
      }
    }else{
      Vue.$prompt(null, '输入名称', {
        inputValue: nodeId,
        inputValidator: (value)=>{return !nodesId.includes(value) && value.trim()!=""},
        inputErrorMessage: '已有同名，请修改名称'
      }).then(({ value }) => {
        resolve(value.trim());
      }).catch(() => {
        Vue.$message({ message: '取消操作',type:'info', showClose: true });
        resolve();
      });
    }
  })
}