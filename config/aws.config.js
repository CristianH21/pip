const fs = require('fs');
const aws = require('aws-sdk'); 
require('dotenv').config();

aws.config.update({
    region: 'us-east-2',
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey
});

const S3_BUCKET = process.env.Bucket;


exports.sign_s3_v2 = data => {
    return new Promise( async (resolve, reject) => {

        const { fileName, fileType, buffer } = data;

        console.log(fileName)
        console.log(fileType)

        const s3 = new aws.S3();
        const s3Params = {
            Bucket: S3_BUCKET,
            Key: fileName,
            Body: buffer,
            Expires: 500,
            ContentType: fileType,
            ACL: 'public-read'
        };

        s3.upload(s3Params, (err, res) => {
            if (err) reject(err);
            resolve(res);
        });

        // s3.getSignedUrl('putObject', s3Params, (err, res) => {
        //     if (err) reject(err);
        //     const returnData = {
        //         signedRequest: res,
        //         url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
        //     };
        //     resolve(returnData);
        // });

    });
}

// Now lets export this function so we can call it from somewhere else
exports.sign_s3 = (data) => {
    const s3 = new aws.S3();  // Create a new instance of S3
    const fileName = req.body.fileName;
    const fileType = req.body.fileType;
    
    // Set up the payload of what we are sending to the S3 api
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 500,
        ContentType: fileType,
        ACL: 'public-read'
    };
    
    // Make a request to the S3 API to get a signed URL which we can use to upload our file
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if(err){
            console.log(err);
            res.json({success: false, error: err})
        }
        
        // Data payload of what we are sending back, the url of the signedRequest and a URL where we can access the content after its saved. 
        const returnData = {
            signedRequest: data,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
        };
        
        // Send it all back
        res.json({success:true, data:{returnData}});
    });
}