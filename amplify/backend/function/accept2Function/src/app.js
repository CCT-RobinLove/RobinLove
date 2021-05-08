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

const getTableName = async () => {
    let tableName = "accept2Table";
    const { ROBIN_ENV } = await getSecrets();
    return tableName + ROBIN_ENV;
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
    const SES = new AWS.SES({ apiVersion: "2010-12-01" });
    const body = req.body;
    console.log(body);
    if (
        !body ||
        !body.subject ||
        !body.acceptor_email ||
        !body.acceptee_email ||
        !body.message
    ) {
        res.statusCode = 400;
        res.json({ error: "malformed body" });
        return "ERROR";
    }

    const charset = "UTF-8"; // encoding

    const dynamodbItem = {
        mail_to: body.acceptor_email,
        accepted_mail: body.acceptee_email,
        status: body.status,
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
    if (body.status) {
        try {
            var params = {
                Destination: {
                    /* required */
                    // CcAddresses: [
                    //     body.email,
                    //     /* more items */
                    // ],
                    ToAddresses: [
                        body.acceptee_email,
                        body.acceptor_email,
                        /* more items */
                    ],
                },
                Message: {
                    Subject: {
                        Data: body.subject,
                        Charset: charset,
                    },
                    /* required */
                    Body: {
                        /* required */
                        // Html: {
                        //     Charset: "UTF-8",
                        //     Data: "HTML_FORMAT_BODY",
                        // },
                        Text: {
                            Charset: charset,
                            Data: body.message,
                        },
                    },
                },
                Source: "cctrobinlove@gmail.com" /* required */,
            };

            // const AttributeParams = {
            //     attributes: {
            //         DefaultSMSType: "alarm",
            //     },
            // };
            // const messageParams = {
            //     Message: body.message,
            //     PhoneNumber: body.phoneNumber,
            // };

            let data = await SES.sendEmail(params).promise();
            // await SNS.setSMSAttributes(AttributeParams).promise();
            // await SNS.publish(messageParams).promise();
            console.log(data);
        } catch (err) {
            res.statusCode = 500;
            console.log("sns error:", err);
            res.json({ error: err, url: req.url, body: req.body });
            return;
        }
    }

    res.json({
        success: "Status Updated",
        body: req.body,
    });
});

app.delete(path + "/object" + hashKeyPath + sortKeyPath, async function (req, res) {
    var params = {};
    if (userIdPresent && req.apiGateway) {
        params[partitionKeyName] =
            req.apiGateway.event.requestContext.identity.cognitoIdentityId ||
            UNAUTH;
    } else {
        params[partitionKeyName] = req.params[partitionKeyName];
        try {
            params[partitionKeyName] = convertUrlType(
                req.params[partitionKeyName],
                partitionKeyType
            );
        } catch (err) {
            res.statusCode = 500;
            res.json({ error: "Wrong column type " + err });
        }
    }
    if (hasSortKey) {
        try {
            params[sortKeyName] = convertUrlType(
                req.params[sortKeyName],
                sortKeyType
            );
        } catch (err) {
            res.statusCode = 500;
            res.json({ error: "Wrong column type " + err });
        }
    }

    const tableName = await getTableName();
    let removeItemParams = {
        TableName: tableName,
        Key: params,
    };
    dynamodb.delete(removeItemParams, (err, data) => {
        if (err) {
            res.statusCode = 500;
            res.json({ error: err, url: req.url });
        } else {
            res.json({ url: req.url, data: data });
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
