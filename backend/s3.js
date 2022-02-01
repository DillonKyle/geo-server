require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')
const path = require('path')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

const s3 =new S3({
    region,
    accessKeyId,
    secretAccessKey
})

function uploadFile(file) {
    console.log(file)
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: "raw-tiff/" + file.originalname
    }

    return s3.upload(uploadParams).promise()
}

exports.uploadFile = uploadFile

function getFileStream(fileKey) {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }

    return s3.getObject(downloadParams).createReadStream()
}

exports.getFileStream = getFileStream

function upload_large_file(file, folder) {

    const fileStream = fs.createReadStream(file)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: folder + path.basename(file)
    }

    return s3.putObject(uploadParams).promise()
    // s3.putObject(uploadParams, (res) => {
    //     console.log("uploaded " + uploadParams.Key)
    // });
}

exports.upload_large_file = upload_large_file