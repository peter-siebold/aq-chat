export const getFileExt = (file, metadata) => {
    let fileExt = "";
    if(metadata.contentType){
        if(metadata.contentType.match(/(?!.*\/)(.*$)/)){
            fileExt = metadata.contentType.match(/(?!.*\/)(.*$)/)[0]
        }
    }
    if(!fileExt && file && file.name){
        if(file.name.match(/(?!.*\.)(.*$)/) ){
            fileExt = file.name.match(/(?!.*\.)(.*$)/)[0];
        }
    }
    if(!fileExt) {
        fileExt = "";
    }
    return fileExt;
}