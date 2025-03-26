import {Button, Modal} from "flowbite-react";
import {TITLE, TRANSLATE} from "../constants.ts";
import {languages} from "../types";
import {Divider} from "./Common.tsx";

export default function Component(props: {
    show: boolean,
    lan: languages,
    setShow: (show: boolean) => void,
}) {
    const {show, setShow, lan} = props

    return <Modal dismissible show={show} onClose={() => setShow(false)}>
        <Modal.Header>{TITLE}</Modal.Header>

        <Modal.Body className={"flex flex-col items-center gap-4 justify-between"}>
            <p>
                {TRANSLATE.aboutInfo[lan]}
            </p>

            <Divider/>

            <div className="flex flex-wrap gap-4 justify-center">
                <Button size={"sm"} outline={true} href={"https://www.buymeacoffee.com/"} target={"_blank"}>
                    {TRANSLATE.coffee[lan]} (1$)
                </Button>
                <Button size={"sm"} outline={true} href={"https://www.buymeacoffee.com/"} target={"_blank"}>
                    {TRANSLATE.bugReport[lan]}
                </Button>
            </div>
        </Modal.Body>
    </Modal>
}
