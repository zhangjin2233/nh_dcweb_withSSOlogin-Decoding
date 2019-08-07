Array.prototype.newTableRow = function(tableData=[], num=0){
  let newRow = {};
  let count = tableData.length ? getCount(this[0].value, this[0].name, tableData) : 1;
  this.forEach(item => {
    newRow[item.name] = item.value == undefined ? "" : item.value;
  });
  while(num--){
    changeVal(newRow, this[num].name, count);
  }
  return newRow;
}

function changeVal(newRow, name, count){
  switch(typeof newRow[name]){
    case 'number':
      newRow[name] = count;
      break;
    case 'string':
      newRow[name] += count;
      break;
    default:
      break;
  }
}

function getCount(val,name,tableData){
  let data = tableData.map(item=>{
    return item[name];
  });
  let max = 0;
  switch(typeof val){
    case 'number':
      max = findMaxInNumer(data,val);
      break;
    case 'string':
      max = findMaxInString(data,val);
      break;
    default:
      break;
  }
  return max+1;
}

function findMaxInNumer(data,val){
  let max = Math.max(...data);
  (max < val) && (max = val);
  return max;
}

function findMaxInString(data,val){
  let numData  = data.map(item => {
    return (val == item.substr(0, val.length) && !isNaN(Number(item.substr(val.length))) ) ? item.substr(val.length) : "";
  });
  return Math.max(...numData);
}
