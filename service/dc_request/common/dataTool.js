function objClone(initalObj, finalObj, attrs, filterFlag){
  var o = finalObj ? objClone(finalObj) : initalObj instanceof Array ? [] : {};
  if(initalObj && typeof initalObj == 'object' && initalObj.constructor !== Object) {
    o.__proto__ = initalObj.__proto__
  }
  for(var k in initalObj) {
    if(attrs && !filterFlag == attrs.includes(k)){
      continue;
    }
    o[k] = (initalObj[k] && typeof(initalObj[k]) === 'object') ? objClone(initalObj[k]) : initalObj[k];
  }
  return o;
}

function addIconFromType(tree){
  tree.forEach(item=>{
    item.icon = utils.getNodeIcon(item.type);
    Array.isArray(item.children) && addIconFromType(item.children);
  })
}

module.exports = {
  setTreeIcon(tree){
    addIconFromType(tree);
  },
  arrayToObj(arr,key,val){
    let obj = {};
    arr.forEach(item=>{
      obj[item[key]] = val ? item[val] : item;
    })
    return obj
  },
  clone(initalObj, finalObj, attrs, filterFlag){
    return objClone(initalObj, finalObj, attrs, filterFlag);
  },
  formatTime(time,format){
    const dateTime = new Date(time);
    const y = dateTime.getFullYear();
    let m = dateTime.getMonth()+1;
    m = m < 10 ? ('0' + m) : m;
    let d = dateTime.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h = dateTime.getHours();
    h = h < 10 ? ('0' + h) : h;
    let min = dateTime.getMinutes();
    min = min < 10 ? ('0' + min) : min;
    let s = dateTime.getSeconds();
    s = s < 10 ? ('0' + s) : s;
    let timeStr;
    switch(format){
      case 'yyyy-mm-dd hh:mm:ss':
        timeStr = `${y}-${m}-${d} ${h}:${min}:${s}`;
        break;
      default:
        timeStr = `${y}-${m}-${d} ${h}:${min}:${s}`;
        break;
    }
    return timeStr;
  },
  resJsonPackage(content) {
    return {
      CONTENT: content,
      ERR_MSG: null,
      STATE: 1
    }
  },
}

