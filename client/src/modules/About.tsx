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

    return <Modal className={"dark:text-gray-50"} dismissible show={show} onClose={() => setShow(false)}>
        <Modal.Header>
            <div className={"flex items-center gap-2"}>
                <img src={"/logo.svg"} alt={"logo"} className={"h-5 max-md:hidden"}/>
                {TITLE}
            </div>
        </Modal.Header>

        <Modal.Body className={"flex flex-col items-center justify-between gap-4"}>
            <p>
                {TRANSLATE.aboutInfo[lan]}
            </p>

            <Divider horizontal={true}/>

            <div className="flex flex-wrap justify-center gap-4">
                <Button size={"sm"} href={"https://www.buymeacoffee.com/"} target={"_blank"}>
                    {TRANSLATE.coffee[lan]} (1$)
                </Button>
            </div>
        </Modal.Body>
    </Modal>
}
