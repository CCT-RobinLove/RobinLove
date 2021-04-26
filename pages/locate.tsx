import Head from "next/head";
import { useEffect, useState } from "react";
import Amplify, { API, PubSub } from "aws-amplify";
// import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { createClient } from "./_app";
import useInterval from "../src/useInterval";

const mapName = "robintestmap"; // HERE IT GOES THE NAME OF YOUR MAP
const indexName = "robinTestIndex"; // HERE GOES THE NAME OF YOUR PLACE INDEX
const trackerName = "robinlovegeotracker"; // HERE GOES THE NAME OF  YOUR TRACKER
const deviceID = "ExampleDevice-4"; // HERE IT GOES THE NAME OF YOUR DEVICE

function Locate() {
    const [test, setTest] = useState("default test");
    const [client, setClient] = useState(null);
    const [devPosMarkers, setDevPosMarkers] = useState([]);

    const [viewport, setViewport] = useState({
        longitude: -123.1187,
        latitude: 49.2819,
        zoom: 10,
    });

    useEffect(() => {
        console.log("Start useEffect");

        (async () => {
            setClient(await createClient());
        })();

        console.log("End useEffect");
    }, []);

    // useInterval(() => {
    //     getDevicePosition();
    // }, 30000);

    const getDevicePosition = () => {
        setDevPosMarkers([]);

        var params = {
            DeviceId: deviceID,
            TrackerName: trackerName,
            StartTimeInclusive: "2020-11-02T19:05:07.327Z",
            EndTimeExclusive: new Date(),
        };

        client.getDevicePositionHistory(params, (err, data) => {
            if (err) console.log(err, err.stack);
            if (data) {
                console.log(data);
                const tempPosMarkers = data.DevicePositions.map(function (devPos, index) {
                    return {
                        index: index,
                        long: devPos.Position[0],
                        lat: devPos.Position[1],
                    };
                });

                setDevPosMarkers(tempPosMarkers);

                const pos = tempPosMarkers.length - 1;

                console.log('tempPosMarkers :>> ', tempPosMarkers);

                // setViewport({
                //     longitude: tempPosMarkers[pos].long,
                //     latitude: tempPosMarkers[pos].lat,
                //     zoom: 5,
                // });
            }
        });
    };

    const addGmail = () => {
        API.post("alarms", "/alarms", {
            body: {
                mail_to: "mail1",
                mail_from: "mail2",
            },
        }).then((r) => {
            console.log("API addGmail finished");
            console.log(r);
        });

        const uploadBody = {
            body: {
                email: "test2@fmail.com",
                imgName: "test.jpg",
                imgContent: "kfjdsklafjldsjfkldsjfioewjiorujeiwokj",
            },
        };

        API.post("uploadz", "/uploadz", uploadBody).then((r) => {
            console.log("API uploadz finished");
            console.log(r);
        });
    };

    const listGmail = () => {
        API.get("alarms", "/alarms/mail1", {}).then((r) => {
            console.log("API listGmail finished");
            console.log(r);
        });

        API.get("uploadz", "/uploadz/mail1", {}).then((r) => {
            console.log("API uploadz finished");
            console.log(r);
        });
    };

    return (
        <div className="">
            <Head>
                <title>RobinLove</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <h1>Locate Page</h1>
            {/* <button onClick={test1}>{"test1"}</button> */}
            <hr />
            <button onClick={getDevicePosition}>{"getDevicePosition"}</button>
            <hr />
            <button onClick={() => console.log("client", client)}>{"client"}</button>
            <hr />
            <button onClick={getDevicePosition}>{"getDevicePosition"}</button>
        </div>
    );
}

export default Locate;
