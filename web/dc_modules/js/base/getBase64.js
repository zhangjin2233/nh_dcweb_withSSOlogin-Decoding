//将已拿到的图片对象转为base64码
function transToBase64(blob){
  return new Promise((resolve,reject)=>{
    let fileReader = new FileReader();
    fileReader.readAsDataURL(blob);
    fileReader.onloadend = function(){
      resolve(fileReader.result)
    };
    fileReader.onerror = function(){
      reject(this)
    }
  })
}

//传入图片路径或图片文件，输出对应的base64码
function getBase64(image){
  if(typeof image == 'string'){
    return new Promise((resolve,reject)=>{
      fetch(image).then(res => { 
        res.blob().then(blob => { 
          resolve(transToBase64(blob)) 
        }) 
      }).catch(err=>{
        reject(err)
      })
    })
  }else if(typeof image == 'object'){
    return transToBase64(image);
  }
}

export default getBase64