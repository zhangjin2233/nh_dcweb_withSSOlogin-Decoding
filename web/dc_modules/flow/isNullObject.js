//判断是否是空对象
function isNullObject(obj) {
  return JSON.stringify(obj) == "{}";
}

export default isNullObject;
