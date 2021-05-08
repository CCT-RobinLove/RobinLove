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

AWS.config.update({
    region: process.env.TABLE_REGION
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

const getTableName = async () => {
    let tableName = "upload2Table";
    const { ROBIN_ENV } = await getSecrets();
    return tableName + ROBIN_ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "email";
const partitionKeyType = "S";
const sortKeyName = "";
const sortKeyType = "";
const hasSortKey = sortKeyName !== "";
const path = "/upload2";
const UNAUTH = "UNAUTH";
const hashKeyPath = "/:" + partitionKeyName;
const sortKeyPath = hasSortKey ? "/:" + sortKeyName : "";
// declare a new express app
var app = express();
app.use(bodyParser.json({ limit: "2gb" }));
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
const getS3 = async () => {

    const { ROBIN_ACCESS_KEY_ID, ROBIN_SECRET_ACCESS_KEY, ROBIN_BUCKET_NAME } = await getSecrets();

    const s3 = new AWS.S3({
        accessKeyId: ROBIN_ACCESS_KEY_ID,
        secretAccessKey: ROBIN_SECRET_ACCESS_KEY,
    });
    const BUCKET_NAME = ROBIN_BUCKET_NAME;

    return { s3, BUCKET_NAME }
    
}

// console.log("Region:", process.env.TABLE_REGION);
// console.log("Table name:", tableName);
// console.log("Bucket name:", BUCKET_NAME);

app.get(path, async function (req, res) {
    var err = null;
    const data = await dynamodb
        .scan({ TableName: tableName })
        .promise()
        .catch((e) => (err = e));

    if (err) {
        res.statusCode = 500;
        res.json({
            message: "ddb scan error",
            error: { err },
        });
    } else {
        res.json({
            message: "scan call succeed!",
            data: data,
        });
    }
});

app.get(path + hashKeyPath, async function (req, res) {
    var condition = {};
    condition[partitionKeyName] = {
        ComparisonOperator: "EQ",
    };

    if (userIdPresent && req.apiGateway) {
        condition[partitionKeyName]["AttributeValueList"] = [
            req.apiGateway.event.requestContext.identity.cognitoIdentityId ||
                UNAUTH,
        ];
    } else {
        try {
            condition[partitionKeyName]["AttributeValueList"] = [
                convertUrlType(req.params[partitionKeyName], partitionKeyType),
            ];
        } catch (err) {
            res.statusCode = 500;
            res.json({ error: "Wrong column type " + err });
        }
    }

    const tableName = await getTableName();
    let queryParams = {
        TableName: tableName,
        KeyConditions: condition,
    };

    dynamodb.query(queryParams, (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.json({ error: "Could not load items: " + err });
        } else {
            res.json(data.Items);
        }
    });
});

app.post(path, async function (req, res) {
    if (userIdPresent) {
        req.body["userId"] =
            req.apiGateway.event.requestContext.identity.cognitoIdentityId ||
            UNAUTH;
    }

    const filePath = req.body.email + "/" + req.body.fileName;
    const fileContent = req.body.fileContent;

    const base64Data = new Buffer.from(
        fileContent.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
    );

    const type = fileContent.split(";")[0].split("/")[1];

    const { s3, BUCKET_NAME } = await getS3();
    const s3Params = {
        Bucket: BUCKET_NAME,
        Key: filePath, // File name you want to save as in S3
        Body: base64Data,
        ContentEncoding: "base64", // required
        ContentType: `image/${type}`, // required. Notice the back ticks
        ACL: "public-read",
    };

    console.log("s3 params:", s3Params);

    try {
        let s3data = await s3.upload(s3Params).promise();
        console.log("Uploaded to s3 success naja:", s3data);

        let verifyEmailData = await new AWS.SES({ apiVersion: "2010-12-01" })
            .verifyEmailIdentity({ EmailAddress: req.body.email })
            .promise();
        console.log(verifyEmailData);
    } catch (err) {
        res.statusCode = 500;
        console.log("err(s3):", err);
        res.json({
            error: err,
            url: req.url,
            body: err,
        });
    }

    // s3.upload(s3Params, (err, data) => {
    //     if (err) {
    //         res.statusCode = 500;
    //         console.log("err(s3):", err);
    //         res.json({
    //             error: err,
    //             url: req.url,
    //             body: err,
    //         });
    //         return;
    //     } else {
    //         console.log("Uploaded to s3 success naja:", data);
    //     }
    // });

    const dynamodbItem = {
        email: req.body.email,
        imgName: filePath,
        lat: req.body.lat,
        long: req.body.long,
    };

    const tableName = await getTableName();
    let putItemParams = {
        TableName: tableName,
        Item: dynamodbItem,
    };
    console.log("Put item params:", putItemParams);

    try {
        let dynamodata = await dynamodb.put(putItemParams).promise();
        console.log("Uploaded to dynamodb success naja:", dynamodata);
    } catch (err) {
        res.statusCode = 500;
        console.log("err(db):", err);
        res.json({ error: err, url: req.url, body: req.body });
        return;
    }
    // dynamodb.put(putItemParams, (err, data) => {
    //     if (err) {
    //         res.statusCode = 500;
    //         console.log("err(db):", err);
    //         res.json({ error: err, url: req.url, body: req.body });
    //         return;
    //     }

    //     console.log("db data:", data);
    // });

    res.json({
        success: "File Uploaded and logged!",
        body: req.body,
    });
});

app.put(path, async function (req, res) {
    if (userIdPresent) {
        req.body["userId"] =
            req.apiGateway.event.requestContext.identity.cognitoIdentityId ||
            UNAUTH;
    }

    const tableName = await getTableName();
    let putItemParams = {
        TableName: tableName,
        Item: req.body,
    };
    dynamodb.put(putItemParams, (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.json({ error: err, url: req.url, body: req.body });
        } else {
            res.json({
                success: "put call succeed!",
                url: req.url,
                data: data,
            });
        }
    });
});

app.listen(3000, function () {
    console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
