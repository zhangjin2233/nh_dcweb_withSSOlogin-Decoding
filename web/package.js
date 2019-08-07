const ora = require('ora')
const spinner = ora('生成压缩文件中 ...')
spinner.start()

const pageConfig = require('../service/conf/dc_page.json');
const targetFileName = pageConfig.title.toLowerCase();
const targetPath = "../package/"+targetFileName; //打包后所存放的路径
const fromPath = "../service/"; //原本项目文件来源
const projectName = "dcweb"; //打包后的项目名称
const packageType = '.zip'; //压缩包的拓展类型
const packageName = projectName + packageType; //压缩包文件名

// 引入相关模块
let fs = require('fs');
let path = require('path');
let archiver = require('archiver'); //压缩

//确保存储路径存在
mkdirsSync(targetPath);

// 打包
package();

//项目打包
function package(){
  // 创建生成的压缩包路径
  let output = fs.createWriteStream(targetPath + '/' + packageName);
  output.on('close', ()=>{ 
    spinner.stop();
    console.log(`压缩完成：${targetPath}/${packageName} (${archive.pointer()} bytes)`); 
  });
  
  let archive = archiver('zip', { zlib: { level: 9 } }); // 设置压缩等级
  archive.pipe(output);
  archive.on('error', (err)=>{ throw err; });
  archive.on('warning', (err) => {
    if(err.code === 'ENOENT'){
      console.warn(err);
    }else{
      throw err
    }
  });

  //将项目文件复制至压缩包所在文件夹中
  archive.directory(fromPath, projectName);
  
  //执行
  archive.finalize();
}

//路径是否存在
function fsExistsSync(path) {
  let exixt = true;
  try{
    fs.accessSync(path,fs.F_OK);
  }catch(e){
    exixt = false;
  }
  return exixt;
}

//创建路径
function mkdirsSync(dir, mode){
  if(fsExistsSync(dir)){
    return true;
  }else{
    if(mkdirsSync(path.dirname(dir), mode)){
      fs.mkdirSync(dir, mode);
      return true;
    }
  }
}