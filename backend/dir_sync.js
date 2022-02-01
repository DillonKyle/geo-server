const fs = require('fs')
const path = require('path')
const async = require('async')
const { file_sync } = require('./file_sync')

function dir_sync(dir_name) {

    var directory = path.join(__dirname, dir_name);
    var og_size = 0
    var fn_size = 0
    var counter = 0

    fs.readdir(directory, (err, files) => {
        if (err) {
            throw err
        }

        files.forEach((file, index, array) => {
            var currentFile = path.join(directory, file)
            og_size = og_size + (fs.statSync(currentFile).size)

            counter++
            file_sync(currentFile, "dir/")
            if (counter == array.length) {
                console.log("number of files: " + "\x1b[33m",counter, "\x1b[0m")
            }

        })

        console.log("total upload size: " + "\x1b[33m", og_size, "\x1b[0m" + " bytes")
    })
}

exports.dir_sync = dir_sync