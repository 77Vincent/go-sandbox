import {Modal} from "flowbite-react";
import {TRANSLATE} from "../lib/i18n.ts";
import {useContext} from "react";
import {AppCtx, displayFileUri} from "../utils.ts";
import {Link} from "react-router-dom";

export default function ShareModal(props: {
    url: string;
    setUrl: (show: string) => void;
}) {
    const {url, setUrl} = props
    const {lan, file} = useContext(AppCtx)

    return (
        <Modal dismissible show={!!url} onClose={() => {setUrl("")}}>
            <Modal.Header>
                {TRANSLATE.share[lan]} {displayFileUri(file)}
            </Modal.Header>

            <Modal.Body className={"break-all text-gray-800 dark:text-gray-200"}>
                <Link target={"_blank"} to={url} className={"text-cyan-500 underline"}>{url}</Link>
            </Modal.Body>
        </Modal>
    )
}
