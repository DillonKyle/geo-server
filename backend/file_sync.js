const fs = require('fs')
const { upload_large_file } = require('./s3')

function file_sync(file, folder) {

    var fileContents = fs.createReadStream(file)
    
    var chunk_arr = []
    console.log(fileContents)
    
    // fileContents.on('data', (chunk, err) => {
    //     if(err) {
    //         return console.log("error: ", err)
    //     }
    //     chunk_arr.push(chunk)
    // })
    
    fileContents.on("end", async() => {
        upload_large_file(fileContents, folder)
    })
} 

exports.file_sync = file_sync