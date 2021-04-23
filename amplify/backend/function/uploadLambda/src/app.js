/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

var express = require("express");
var bodyParser = require("body-parser");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

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

// for receiving images
const fs = require("fs");
const fileType = require("file-type");
const multiparty = require("multiparty");

// S3
const AWS = require("aws-sdk");
const BUCKET_NAME = process.env.BUCKET;
const IAM_USER_KEY = process.env.ACCESS_KEY_ID;
const IAM_USER_SECRET = process.env.SECRET_KEY_ID;

const s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
});

// DynamoDB

/**********************
 * Example get method *
 **********************/

// app.get("/upload", function (req, res) {
//     // Add your code here
//     res.json({ success: "get call succeed!", url: req.url });
// });

// app.get("/upload/*", function (req, res) {
//     // Add your code here
//     res.json({ success: "get call succeed!", url: req.url });
// });

/****************************
 * Example post method *
 ****************************/

const uploadFile = (buffer, name, type) => {
    const params = {
        Body: buffer,
        Bucket: BUCKET_NAME,
        ContentType: type.mime,
        Key: `${name}.${type.ext}`,
    };
    return s3bucket.upload(params).promise();
};

app.post("/upload", function (req, res) {
    // Add your code here
    const form = new multiparty.Form();

    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.status(500).send(error);
        }
        try {
            const user = req.email;
            const path = files.file[0].path;
            const buffer = fs.readFileSync(path);
            const type = await fileType.fromBuffer(buffer);
            const fileName = `${user}/${Date.now().toString()}`;
            const data = await uploadFile(buffer, fileName, type);
            return res.status(200).send(data);
        } catch (err) {
            return res.status(500).send(err);
        }
    });
    // res.json({ success: "post call succeed!", url: req.url, body: req.body });
});

app.post("/upload/*", function (req, res) {
    // Add your code here
    res.json({ success: "post call succeed!", url: req.url, body: req.body });
});

/****************************
 * Example put method *
 ****************************/

app.put("/upload", function (req, res) {
    // Add your code here
    res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

app.put("/upload/*", function (req, res) {
    // Add your code here
    res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

/****************************
 * Example delete method *
 ****************************/

app.delete("/upload", function (req, res) {
    // Add your code here
    res.json({ success: "delete call succeed!", url: req.url });
});

app.delete("/upload/*", function (req, res) {
    // Add your code here
    res.json({ success: "delete call succeed!", url: req.url });
});

app.listen(3000, function () {
    console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
