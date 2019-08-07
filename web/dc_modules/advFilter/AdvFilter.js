
let structor = {
  vue: {},
  toolbar:[{
    title: '新增“与”逻辑',
    label: 'and',
    name: 'and',
    disabled: function(advFilter){
      return advFilter.currentNodeIndex<0 || (advFilter.currentNode.flag !== 'and' && advFilter.currentNode.flag !== 'or' && !!advFilter.currentNode.flag)
    },
    click: (advFilter,btn)=>{
      advFilter.addLeaf(btn);  
    }
  },{
    title: '新增“或”逻辑',
    label: 'or',
    name: 'or',
    disabled: function(advFilter){
      return advFilter.currentNodeIndex<0 || (advFilter.currentNode.flag!=='and' && advFilter.currentNode.flag!=='or' && !!advFilter.currentNode.flag)
    },
    click: (advFilter,btn)=>{
      advFilter.addLeaf(btn);  
    }
  },{
    title: '新增规则',
    name: 'rule',
    style: 'color: blue',
    icon: 'fa fa-filter',
    disabled: function(advFilter){
      return advFilter.currentNodeIndex<0 || (advFilter.currentNode.flag!=='and' && advFilter.currentNode.flag!=='or' && !!advFilter.currentNode.flag)
    },
    click: (advFilter,btn)=>{
      advFilter.addLeaf(btn);  
    }
  },{
    title: '删除',
    name: 'remove',
    style: 'color: red',
    icon: 'el-icon-close',
    disabled: function(advFilter){
      return JSON.stringify(advFilter.currentNode)=='{}'
    },
    click: (advFilter,btn)=>{
      advFilter.removeLeaf();
    }
  },{
    title: '清空所有',
    name: 'clear',
    style: 'color: red',
    icon: 'fa fa-trash',
    // disabled: function(advFilter){
    //   return !advFilter.treeData.length;
    // },
    click: (advFilter,btn)=>{
      advFilter.clearTree();
    }
  }],
  currentNode: {},
  where: '',
  attr:{
    option: [{
      label: "描述",
      value: 'desc'
    }],
    placeholder: '请选择',
  },
  treeData: [],
  node: {
    name: '',
    value: '',
    flag: '',
    children: []
  },
  expandKeys: [],
  fatherNode: {},
  currentNodeIndex: 0,
  emptyText: "",
  accordion: false,
  hightLightCurrent: true,
  type: '', //表示过滤器的类型,比如type:'mainJob'类型
  option_leftV: [],
  option_op: [{
    label: '=',
    value: '='
  },{
    label: '>=',
    value: '>='
  },{
    label: '<=',
    value: '<='
  },{
    label: '>',
    value: '>'
  },{
    label: '<',
    value: '<'
  },{
    label: '!=',
    value: '!=',
  },{
    label: 'is not null',
    value: 'is not null'
  },{
    label: 'is null',
    value: 'is null'
  },{
    label: 'in',
    value: 'in'
  },{
    label: 'not in',
    value: 'not in'
  }],
  option_rightV: [],
  type1:{
    placeholder: "请选择",
    option: [{
      label: 'and',
      value: 'and',
    },{
      label: 'or',
      value: 'or'
    }]
  },
  type2:{
    placeholder: "请选择",
    option: [{
      label: 'like',
      value: 'like',
    },{
      label: '=',
      value: 'equal'
    },{
      label: '<>',
      value: 'notEqual'
    }]
  },
  type3: {
    option: [{
      label: '=',
      value: '='
    },{
      label: '>=',
      value: '>='
    },{
      label: '<=',
      value: '<='
    },{
      label: '>',
      value: '>'
    },{
      label: '<',
      value: '<'
    },{
      label: '!=',
      value: '!=',
    },{
      label: 'is not null',
      value: 'is not null'
    },{
      label: 'is null',
      value: 'is null'
    },{
      label: 'in',
      value: 'in'
    },{
      label: 'not in',
      value: 'not in'
    }]
  }
  // test1: {
  //   a: 'a',
  //   b: 'b',
  // }
  
}

class AdvFilter {
  constructor(obj) {
    for(let i in structor){
      this[i] = structor[i];
    }
    if(obj){
      for(let i in obj){
        this[i] = obj[i];
      }
    }
  }
  initAll(Vue){
    this.vue = Vue;
    Vue.propData.data && (this.treeData = Vue.propData.data);
    this.treeData.length && (this.currentNodeIndex=-1);
  }
  addLeaf(btn){
    let currentNode = this.currentNode;
    let node = {
      name: '',
      value: '',
      flag: '',
      label: '',
      children: [],
      id: (new Date()).getTime()
    }
    switch(btn.name){
      case 'and':
      case 'or':
        node.flag = btn.name;
        node.label = this.type1.option.find(obj => node.flag == obj.value).label;
        break;
      case 'rule':
        if(this.type == 'mainJob'){
          node.name = this.option_leftV[0] ? this.option_leftV[0].value : '';
          node.value = this.option_rightV[0] ? this.option_rightV[0].value : '';
          node.flag = this.option_op[0] ? this.option_op[0].value : '';
        }else{
          node.name = this.attr.option[0] ? this.attr.option[0].value : '';
          node.value = '%%';
          node.flag = this.type2.option[0] ? this.type2.option[0].value : '';
        }
        this.getNodeLabel(node);
        break;
      default:
        break;
    }
    if(!currentNode.children) {
      this.treeData.push(node);
    }else{
      currentNode.children.push(node);
      this.expandKeys.push(node.id);
    }
    setTimeout(() => {
      this.vue.$refs.filterTree.setCurrentKey(node.id);
      this.currentNode = this.vue.$refs.filterTree.getCurrentNode();
    }, 0)
  }
  removeLeaf(){
    this.vue.$refs.filterTree.remove(this.currentNode);
    this.currentNode = {};
    this.currentNodeIndex = this.treeData.length ? -1 : 0;
  }
  clearTree(){
    this.treeData.splice(0,this.treeData.length);
    this.currentNode = {};
    this.currentNodeIndex = 0;
  }
  handleNodeClick(data){
    this.currentNode = data;
    this.currentNodeIndex = 0;
  }
  showType(type,val){
    return this[type].option.findIndex(obj=> obj.label==val || obj.value==val) != -1;
  }
  getNodeLabel(node) {
    if(this.type == 'mainJob'){
      let left = node.name ? node.name.split(':').slice(-1)[0] : '';
      let right = node.value ? node.value.split(':').slice(-1)[0] : '';
      node.label = `${left} ${node.flag} ${right}`;
      // node.label = `${node.name} ${node.flag} ${node.value}`;
    }else{
      switch(node.flag){
        case 'like':
          node.label = `p${node.name} ${node.flag} ${node.value} escape '\\'`;
          break;
        case 'equal':
          node.label = `p${node.name} = '${node.value}'`;
          break;
        case 'notEqual':
          node.label = `p${node.name} <> '${node.value}'`;
          break;
        default:
          break;
      }
    }
  }
  setAttrVal(key,val){
    this[key] = val;
  }
  setAttrs(obj){
    for(let i in obj){
      this[i] = obj[i];
    }
  }
}

export default AdvFilter;