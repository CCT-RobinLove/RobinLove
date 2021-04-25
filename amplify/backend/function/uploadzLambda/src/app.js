/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const AWS = require("aws-sdk");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
var bodyParser = require("body-parser");
var express = require("express");

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "uploadz";
if (process.env.ENV && process.env.ENV !== "NONE") {
    tableName = tableName + "-" + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "email";
const partitionKeyType = "S";
const sortKeyName = "";
const sortKeyType = "";
const hasSortKey = sortKeyName !== "";
const path = "/uploadz";
const UNAUTH = "UNAUTH";
const hashKeyPath = "/:" + partitionKeyName;
const sortKeyPath = hasSortKey ? "/:" + sortKeyName : "";
// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
    switch (type) {
        case "N":
            return Number.parseInt(param);
        default:
            return param;
    }
};

// S3
const s3 = new AWS.S3({
    // accessKeyId: process.env.ACCESS_KEY_ID,
    // secretAccessKey: process.env.SECRET_ACCESS_KEY,
});
const BUCKET_NAME = process.env.BUCKET_NAME;
console.log("Region:", process.env.TABLE_REGION);
console.log("Table name:", tableName);
console.log("Bucket name:", BUCKET_NAME);

// for image receiving
const fs = require("fs");
const fileType = require("file-type");

const uploadFile = (buffer, name, type) => {
    const params = {
        Body: buffer,
        Bucket: BUCKET_NAME,
        ContentType: type.mime,
        Key: `${name}.${type.ext}`,
    };
    return s3bucket.upload(params).promise();
};

app.post(path, async function (req, res) {
    // (async () => {
    if (userIdPresent) {
        req.body["userId"] =
            req.apiGateway.event.requestContext.identity.cognitoIdentityId ||
            UNAUTH;
    }

    // s3

    // Add your code here
    try {
        const user = req.body.email;
        const path = req.body.filepath;
        const buffer = fs.readFileSync(path);
        const type = await fileType.fromBuffer(buffer);
        const fileName = `${user}/${req.body.imgName}`;
        const data = await uploadFile(buffer, fileName, type);
        console.log("s3 data:", data);
    } catch (err) {
        return res.status(500).send("It is not working...so sad TT");
    }

    // const filePath = req.body.email + "/" + req.body.imgName;
    // const fileContent = req.body.imgContent;

    // const s3Params = {
    //     Bucket: BUCKET_NAME,
    //     Key: filePath, // File name you want to save as in S3
    //     Body: fileContent,
    // };
    // console.log("s3 params:", s3Params);

    // s3.upload(s3Params, (err, data) => {
    //     if (err) {
    //         res.statusCode = 500;
    //         console.log("err(s3):", err);
    //         res.json({
    //             error: err,
    //             url: req.url,
    //             body: err,
    //         });
    //     }
    //     // return data;
    // });

    const dynamodbItem = {
        email: req.body.email,
        imgName: path,
        lat: req.body.lat,
        long: req.body.long,
    };

    let putItemParams = {
        TableName: tableName,
        Item: dynamodbItem,
    };
    console.log("Put item params:", putItemParams);

    dynamodb.put(putItemParams, (err, data) => {
        if (err) {
            res.statusCode = 500;
            console.log("err(db):", err);
            res.json({ error: err, url: req.url, body: req.body });
        }

        // return data;
    });

    res.json({
        success: "File Uploaded and logged!",
        body: req.body,
    });
    // })();
});

/**************************************
 * HTTP remove method to delete object *
 ***************************************/

app.listen(3000, function () {
    console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
