import Flow from './Flow'

let toolbar = [{
  icon: 'fa fa-save',
  color: 'blue',
  title: '保存 ctrl+s',
  event:{
    click: function(){
      this.flow.saveFlow(this);
    }
  },
},{
  icon: 'fa fa-plus',
  color: 'green',
  title: '新增节点',
  event:{
    click: function(){
      // let reqData = { id: this.flow.nodeTree.pId ? this.flow.pId : this.flow.flowName }
      let reqData = { storyId:this.flow.storyId, type:this.flow.dcType.toUpperCase() }
      this.$openDialog(new dc.Dialog({
        top: '40px',
        width: '500px',
        title: '新增'+this.flow.dcType.toUpperCase()+'节点',
        component: 'dc-nodeTree',
        data: { reqData:reqData, dcType:this.flow.dcType, url:this.flow.nodeTree.url },
        hasBtn: true,
        btnGroup: [{
          text: '确定', 
          type: 'primary', 
          size: 'small', 
          click:(dialog, component)=>{ 
            let selectNodes = !component.tree.nodeSelection ? [] : component.tree.nodeSelection.filter(item=>{
              return item.type.toLowerCase() == this.flow.dcType
            })
            if(selectNodes.length){
              this.flowLoading = true;
              let reqData1 = {
                nodesId: selectNodes.map(item=>{return item.link}),
                type: this.flow.dcType
              };
              DCHttp.req({url:this.flow.getDC.url, params:reqData1}).then(res=>{
                this.flowLoading = false;
                res && this.flow.addNode(res.CONTENT);
              }).catch(err=>{ this.flowLoading = false; })
            }else{
              this.$message({message:"未选中",showClose:true});
            }
            dialog.show = false;
          }
        }]
      }))
    }
  }
},{
  title: '切换列表展示',
  icon: 'fa fa-list-ul',
  color: 'green',
  event: {
    click: function(){
      this.flow.changeAllTextListShow(this);
    }
  }
}];

let structor = {
  nodeAttrs: ["id","textList","title"],
  type: 'textList',
  domType: 'html',
  nodeContainerStyle: "background:#a4e2c6; padding:10px; border:solid 1px; border-radius:5px;",
  canRemoveLine: true,
  isContactAttach: true,
  size:{
    node: {
      width: 200,
    }
  },
  layout:{
    'delta': 10,
    'fixed': {
      'x': 0,
      'y': 100,
      'marginRight': 350,
      'marginBottom': 300,
    },
    colSpace: 250, //当切换为布局算法时起效
    rowSpace: 100, //当切换为布局算法时起效
    'rankdir': "LR",
    'ratioHeight': 45,
    'widthBorder': 80,
    'wide': 3,
    'narrow': 2.5,
  },
  moveSpace: 200,
  nodeTree: {
    url: '/api/tree/getAllTree',
  },
  getDC: {
    url: '/api/tree/getAddFlow',
  },
}

class reportFlow extends Flow{
  constructor(obj) {
    super();
    for(let i in structor){
      this[i] = structor[i];
    }
    this.setToolbar('add',toolbar[2], 0, 3).setToolbar('add',toolbar[1],0,1).setToolbar('add',toolbar[0]);
    if(obj){
      for(let i in obj){
        this[i] = (typeof obj[i] === 'object' && obj[i] != null) ? objClone(obj[i],this[i]) : obj[i];
      }
    }
  }
  changeNodeTextListShow(node){
    node.listShow = !node.listShow;
    node.height = this.titleLineHeight+this.textListLineHeight*(node.listShow ? node.textList.length : 0);
  }
  changeAllTextListShow(Vue){
    for(let k in Vue.nodes){
      this.changeNodeTextListShow(Vue.nodes[k]);
    }
  }
  saveFlow(Vue){ //保存主流图
    Vue.flowLoading = true;
    let data = objClone(this.flowResData,{ saveData:{ id: this.flowName } },['nodes','links']);
    data.nodes = {};
    Object.keys(Vue.nodes).forEach(key=>{
      data.nodes[key] = objClone(Vue.nodes[key],{},['x','y'],true)
    })
    data.links = Vue.lines;
    DCHttp.req({url:this.req.saveFlow.url, params:data, method:'POST', info:{success:'保存成功',error:'保存失败'}}).then(res=>{
      Vue.flowLoading = false;
    }).catch(err=>{
      Vue.flowLoading = false;
    });
  }
  updateNode(){
    let dc = JSON.parse(window.sessionStorage.getItem('dc'));
    window.sessionStorage.removeItem('dc');
    let nodeId = this.vue.focusNodes[0];
    this.vue.nodes[nodeId].title = dc.dcLabel;
    this.vue.nodes[nodeId].textList.splice(0,this.vue.nodes[nodeId].textList.length,...dc.textList);
    this.vue.nodes[nodeId].height = this.titleLineHeight+this.textListLineHeight*(this.vue.nodes[nodeId].listShow ? this.vue.nodes[nodeId].textList.length : 0); 
  }
  nodeRightClick(e,node,Vue){ //节点右击
    Vue.moveOver();
    let index = Vue.lines.findIndex(item=>JSON.stringify(item) == JSON.stringify([node.id,node.id]));
    let contextmenu = [{
      text: '编辑表单',
      icon: 'fa fa-edit',
      iconColor: 'blue',
      click: function(){
        Vue.flow.nodeDbClick(e,node,Vue);
        Vue.flow.contextmenu.hideMenu();
      }
    },{
      text: '删除',
      icon: 'fa fa-remove',
      iconColor: 'red',
      click: function(){
        Vue.nodeObj.remove(Vue);
        Vue.flow.contextmenu.hideMenu();
      }
    }]
    this.contextmenu.showMenu(e,contextmenu);
  }
}

export default reportFlow