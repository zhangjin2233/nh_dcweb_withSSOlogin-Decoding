// initalObj为克隆的来源,
// finalObj为最终目标,
// attrs为obj的属性子集,
// filterFlag为true表示只克隆attrs中的属性,为false表示克隆除attrs中的属性
function objClone(initalObj, finalObj, attrs, filterFlag){
  var o = finalObj ? objClone(finalObj) : initalObj instanceof Array ? [] : {};
  for(var k in initalObj) {
    if(attrs && !!filterFlag == (attrs.indexOf(k) == -1)){
      continue;
    }
    o[k] = (typeof(initalObj[k]) === 'object')&&(initalObj[k] != null) ? objClone(initalObj[k]) : initalObj[k];
  }
  return o;
}

export default objClone;