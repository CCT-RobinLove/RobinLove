//usepollalert ส่ง req ไป get table ที่ชื่อ alert เรื่อยๆ
import Amplify, { API, Auth } from "aws-amplify";
import useInterval from "./useInterval";
import { useRouter } from "next/router";

async function checkAlert(email, router) {
    if (router.pathname != "/match") return;

    console.log("check alert called", email);

    let err;
    const [res] = await API.get("alert2", `/alert2/${email}`, {}).catch((e) => {
        err = e;
        console.log("checkAlert Failed", e);
    });
    if (err) return;

    if (!res) return;

    router.push(`/call?mail_from=${res.mail_from}&mail_to=${email}`);
}

async function useAlertPoll(email) {
    const router = useRouter();
    useInterval(() => checkAlert(email, router), 20_000);
}

async function checkAccept(email, router) {
    if (router.pathname != "/matching") return;

    console.log("checkAccept called");

    let err;
    const [res] = await API.get("accept2", `/accept2/${email}`, {}).catch(
        (e) => (err = e)
    );
    if (err) return console.log("checkAccept get Failed", err);

    if (!res) return;

    const { accepted_mail, status, mail_to } = res;
    if (!accepted_mail) return;

    let err2;
    await API.del("accept2", `/accept2/object/${accepted_mail}`, {}).catch(
        (e) => (err2 = e)
    );
    if (err2) return console.log("checkAccept del Failed", err2);

    if (status == 1) return router.push(`/matched?mail_from=${mail_to}`);

    if (status == 0) return router.push(`/match`);

    // return "finish";
}

async function useAcceptPoll(email) {
    const router = useRouter();
    useInterval(() => checkAccept(email, router), 20_000);
}

export { checkAlert, useAlertPoll, checkAccept, useAcceptPoll };
