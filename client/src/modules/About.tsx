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

        <Modal.Body className={"flex flex-col items-center justify-between gap-4"}>
            <p>
                {TRANSLATE.aboutInfo[lan]}
            </p>

            <Divider horizontal={true}/>

            <div className="flex flex-wrap justify-center gap-4">
                <Button size={"sm"}  outline={true} href={"https://www.buymeacoffee.com/"} target={"_blank"}>
                    {TRANSLATE.coffee[lan]} (1$)
                </Button>
            </div>
        </Modal.Body>
    </Modal>
}
