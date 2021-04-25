import Amplify, { API } from "aws-amplify";
import useInterval from "./useInterval";

function updateLocation() {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const {
                coords: { latitude, longitude },
            } = pos;

            API.post("upload2", "/upload2", {
                body: {
                    lat: latitude,
                    long: longitude,
                },
            }).then((r) => console.log(`finished update location:`, r));
        },
        (err) => console.log(`err`, err)
    );
}

export default function useUpdateLocation() {
    useInterval(updateLocation, 30_000);
}

export { updateLocation };
