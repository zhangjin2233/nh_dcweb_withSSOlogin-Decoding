import params from './params'

let tableHead = [{
  label: 'ID',
  name: 'id',
  type: 'String',
},{
  label: 'PDC',
  name: 'PDC',
  type: 'String'
},{
  label: '作业',
  name: 'job',
  type: 'String'
}];

let tableParams = {
  align: 'center',
  height: document.documentElement.clientHeight - 230 + 'px',
  tableHead: tableHead,
  tableData: [],
  hiddenCols: ['id'],
  hasPage: false,
  editable: false,
  btnGroup: [{
    icon: "fa fa-plus", 
    color: "green",
    title: '新增',
    click: (tableData)=>{
      addNodeFun('pdc',tableData);
    }
  },{
    icon: "fa fa-remove", 
    color: "red",
    title: '删除',
    needRow: true,
    click:(tableData, row)=>{
      let index = tableData.findIndex(item=>item==row);
      tableData.splice(index,1);
    }
  }]
};

function addTableRows(tableData,res){
  let rows = getTableRowData(res);
  tableData.splice(tableData.length-1,0,...rows);
};

function addNodeFun(flag, tableData){
  let dialog = new dc.Dialog({
    top: "30px",
    width: '700px',
    component: 'nodeList',
    data: {flag: flag, flowName: params.flowName, storyId:params.storyId},
    hasBtn: true,
    btnGroup: [{
      text: '确定', 
      type: 'primary', 
      size: 'small', 
      click:(dialog, component)=>{ 
        let list = [];
        component.table1.tableData.map((item)=>{
          list.push(item.guid); 
        })
        if(list.length){
          let data = {
            type: 'PDC',
            pdcs: component.table1.tableData,
            flag: flag,
            cdcId: component.leafId,
            flowId: params.flowName
          };
          DCHttp.req({url:params.req.addNode.url,params:data}).then(res=>{
            res && addTableRows(tableData,res);
          })
        }
        dialog.show = false;
      }
    }]
  });
  VUE.$openDialog(dialog);
}

function getTableRowData(res){
  let nodes = res.CONTENT.nodes;
  let rows = Object.keys(nodes).map(k=>{
    return {
      id: nodes[k],
      PDC: nodes[k].guid,
      job: "MainJob"
    }
  })
  return rows;
};

export default {
  tableParams,
}