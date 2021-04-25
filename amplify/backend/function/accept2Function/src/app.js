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

const region = "ap-northeast-1";

const secretName = "prod/robin";
async function getSecrets() {
    var secret_err;
    const secretResponse = await client
        .getSecretValue({ SecretId: secretName })
        .promise()
        .catch((e) => (secret_err = e));
    const {
        ROBIN_ACCESS_KEY_ID,
        ROBIN_BUCKET_NAME,
        ROBIN_ENV,
        ROBIN_REGION,
        ROBIN_SECRET_ACCESS_KEY,
        ROBIN_TABLE_REGION,
    } = secretResponse.SecretString;
    return {
        ROBIN_ACCESS_KEY_ID,
        ROBIN_BUCKET_NAME,
        ROBIN_ENV,
        ROBIN_REGION,
        ROBIN_SECRET_ACCESS_KEY,
        ROBIN_TABLE_REGION,
    };
}

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "accept2Table";
if (process.env.ENV && process.env.ENV !== "NONE") {
    tableName = tableName + "-" + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "accepted_mail";
const partitionKeyType = "S";
const sortKeyName = "";
const sortKeyType = "";
const hasSortKey = sortKeyName !== "";
const path = "/accept2";
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

app.post(path, async function (req, res) {
    const SNS = new AWS.SNS();
    const body = req.body;
    if (!body || !body.phoneNumber || !body.message) {
        res.statusCode = 400;
        res.json({ error: "malformed body" });
        return "ERROR";
    }
    const AttributeParams = {
        attributes: {
            DefaultSMSType: "alarm",
        },
    };
    const messageParams = {
        Message: body.message,
        PhoneNumber: body.phoneNumber,
    };
    try {
        // await SNS.setSMSAttributes(AttributeParams).promise();
        await SNS.publish(messageParams).promise();
    } catch (err) {
        res.statusCode = 500;
        console.log("sns error:", err);
        res.json({ error: err, url: req.url, body: req.body });
        return;
    }
    res.json({
        success: "Message sent",
        body: req.body,
    });
});

app.listen(3000, function () {
    console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
