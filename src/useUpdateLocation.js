import Amplify, { API, Auth } from "aws-amplify";
import useInterval from "./useInterval";

function updateLocation() {
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const {
                coords: { latitude, longitude },
            } = pos;

            const {
                attributes: { email },
            } = await Auth.currentAuthenticatedUser();

            API.put("upload2", "/upload2", {
                body: {
                    email,
                    lat: latitude,
                    long: longitude,
                },
            }).then((r) => console.log(`finished update location:`, r));
        },
        (err) => console.log(`err`, err)
    );
}

export default function useUpdateLocation() {
    useInterval(updateLocation, 5_000);
}

export { updateLocation };
