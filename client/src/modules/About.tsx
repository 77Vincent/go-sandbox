import {Button, Modal} from "flowbite-react";
import {FaGithub, FaCoffee} from "react-icons/fa";

import {TITLE, TRANSLATE} from "../constants.ts";
import {languages} from "../types";
import {Divider} from "./Common.tsx";
import {Link} from "react-router";

export default function Component(props: {
    show: boolean,
    lan: languages,
    setShow: (show: boolean) => void,
}) {
    const {show, setShow, lan} = props

    return <Modal dismissible show={show} onClose={() => setShow(false)}>
        <Modal.Header>
            <div className={"flex items-center gap-2"}>
                <img src={"/logo.svg"} alt={"logo"} className={"h-5 max-md:hidden"}/>
                {TITLE}
            </div>
        </Modal.Header>

        <Modal.Body className={"flex flex-col items-center justify-between gap-4"}>
            <p className={"dark:text-gray-50"}>
                {TRANSLATE.aboutInfo[lan]}
            </p>

            <Divider horizontal={true}/>

            <div className="flex flex-wrap justify-center gap-3">
                <Button size={"xs"}
                        as={Link}
                        className={"hover:opacity-80"}
                        gradientMonochrome={"cyan"}
                        to={"https://www.buymeacoffee.com/"} target={"_blank"}>
                    <div className={"flex items-center gap-2"}>
                        <FaCoffee size={20}/>
                        {TRANSLATE.coffee[lan]}
                    </div>
                </Button>

                <Button size={"xs"}
                        as={Link}
                        className={"hover:opacity-80"}
                        to={"https://github.com/77Vincent/go-sandbox"} target={"_blank"}>
                    <div className={"flex items-center gap-2"}>
                        <FaGithub size={20}/>
                        GitHub
                    </div>
                </Button>
            </div>
        </Modal.Body>
    </Modal>
}
