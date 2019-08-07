#!/bin/bash
#用于前端自动打包dcweb项目

# folderName=dcweb1.2.2
# cd ./package
# if [ -e ${folderName} ] 
# then
#     echo 覆盖目录${folderName}
#     rm -rf ./${folderName}
#     mkdir ${folderName}
# else
#     mkdir ${folderName}
#     echo 创建了目录${folderName}
# fi

# sourceFile=service #dcweb的项目包名字
# targetFile=dcweb #最终解压出来的文件名

# if test -e ../${sourceFile}

# then
#     cp -rf ../${sourceFile} ${folderName}
#     mv -f ./${folderName}/${sourceFile} ./${folderName}/${targetFile}
#     echo 开始打包windows版本
#     cp -rf ./node_modules/win ./${folderName}/${targetFile}
#     rm -rf ./${folderName}/${targetFile}/node_modules
#     mv -f ./${folderName}/${targetFile}/win ./${folderName}/${targetFile}/node_modules
#     cd ./${folderName}
#     zip -r ./${targetFile}_win.zip ./${targetFile}
#     cd ..
#     echo windows版本打包成功！

    # echo 开始打包mac版本
    # cp -rf ./node_modules/mac ./${folderName}/${targetFile}
    # rm -rf ./${folderName}/${targetFile}/node_modules
    # mv -f ./${folderName}/${targetFile}/mac ./${folderName}/${targetFile}/node_modules
    # cd ./${folderName}
    # zip -r ./${targetFile}_mac.zip ./${targetFile}
    # cd ..
    # echo mac版本打包成功！

    # echo 开始打包linux64位版本
    # cp -rf ./node_modules/linux_x64 ./${folderName}/${targetFile}
    # rm -rf ./${folderName}/${targetFile}/node_modules
    # mv -f ./${folderName}/${targetFile}/linux_x64 ./${folderName}/${targetFile}/node_modules
    # cd ./${folderName}
    # tar -czvf ./${targetFile}_linux_x64.tar.gz ./${targetFile}
    # rm -rf ./${targetFile}
    # echo mac版本打包成功！
    # cp -rf ./linux_x64 ./${folderName}
    # cp -rf ./${folderName}/${targetFile} ./${folderName}/linux_x64
    # cp -rf ./node_modules/linux_x64 ./${folderName}/linux_x64/${targetFile}
    # cd ./${folderName}
    # rm -rf ./linux_x64/${targetFile}/node_modules
    # mv -f ./linux_x64/${targetFile}/linux_x64 ./linux_x64/${targetFile}/node_modules
    # mv -f ./linux_x64 ./${targetFile}_linux_x64
    # tar -czvf ./${targetFile}_linux_x64.tar.gz ./${targetFile}_linux_x64
    # cd ..
    # rm -rf ./${folderName}/linux_x64
    # rm -rf ./${folderName}/${targetFile}
    # rm -rf ./${folderName}/${targetFile}_linux_x64
#     echo linux64位版本打包成功！
#     echo 打包成功！
# else
#  echo 项目打包的资源不存在或名字不相符
# fi


targetFile=dcweb
sourceFile=service #dcweb的项目包名字
cp -r ${sourceFile} ${targetFile}
tar -czvf ${targetFile}.tar.gz ${targetFile}
rm -rf ${targetFile}
mv ${targetFile}.tar.gz ./package/


