import {Button, Modal} from "flowbite-react";
import {TRANSLATE} from "../constants.ts";
import {languages} from "../types";

export default function Component(props: {
    show: boolean,
    lan: languages,
    setShow: (show: boolean) => void,
}) {
    const {show, setShow, lan} = props

    return <Modal dismissible show={show} onClose={() => setShow(false)}>
        <Modal.Header>{TRANSLATE.about[lan]}</Modal.Header>
        <Modal.Body>
            <Button gradientDuoTone={"purpleToBlue"} href={"https://www.buymeacoffee.com/"} target={"_blank"}>
                {TRANSLATE.buyMeACoffee[lan]} (1$)
            </Button>
        </Modal.Body>
    </Modal>
}
