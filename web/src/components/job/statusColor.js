
let color = {
  'Checking Condition': '#fec0c2',
  'Pooling': '#0a00ff',
  'Running': '#fbfc24',
  'Suspend': '#5dc1f3',
  'Total': '#bbcdc5',
  'Run Failed': '#ff232c',
  'Ignore Fail': '#efa012',
  'Terminated': '#ef00e7',
  'Run OK': '#33ff21',
  'Waiting': '#eceeec',
  '启动条件': '#fec0c2',
  '正在排队': '#0a00ff',
  '正在运行': '#fbfc24',
  '挂起': '#5dc1f3',
  '运行失败': '#ff232c',
  '运行出错': '#ff232c',
  '忽略错误': '#efa012',
  '强制终止': '#ef00e7',
  '运行成功': '#33ff21',
  '等待中': '#eceeec',
  '全部': '#bbcdc5'
}
let statusColor = (value, prop, row) => {
  if((value > 0 && color.hasOwnProperty(prop))) {
    return { background: color[prop] }
  }else if(color.hasOwnProperty(row[prop]) && row[prop]){
    return { background: color[row[prop]] }
  }
}

export { color, statusColor }