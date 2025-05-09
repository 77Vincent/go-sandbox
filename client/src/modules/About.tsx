import {Button, Modal} from "flowbite-react";

import {TITLE} from "../constants.ts";
import {Divider} from "./Common.tsx";
import {Link} from "react-router";
import {MailIcon} from "./Icons.tsx";

export default function Component(props: {
    show: boolean,
    setShow: (show: boolean) => void,
}) {
    const {show, setShow} = props

    return <Modal dismissible show={show} onClose={() => setShow(false)}>
        <Modal.Header>
            <div className={"flex items-center gap-2"}>
                <img src={"/favicon-512x512.png"} alt={"logo"} className={"mr-1 h-6 max-md:hidden"}/>
                {TITLE}
            </div>
        </Modal.Header>

        <Modal.Body>
            <div className={"flex flex-col gap-4 font-light dark:text-gray-50"}>
                <p className={"font-semibold italic"}>
                    I need a more powerful online Go editor, so I made this. Hope it is useful for you too.
                </p>

                <ul className={"list-inside list-disc indent-4"}>
                    <li>Realtime execution using websocket</li>
                    <li>LSP-backed tools</li>
                    <li>Multiple sandboxes</li>
                    <li>Share code snippet</li>
                    <li>Rich snippet library</li>
                    <li>Rich keybinding support</li>
                </ul>

                <Divider horizontal={true}/>

                <p>
                    This project is inspired by the official
                    <a className={"mx-1 text-cyan-600"} href={"https://play.golang.org/"} target={"_blank"}>Go
                        Playground</a> and <a className={"mx-1 text-cyan-600"} href={"https://goplay.tools/"}
                                              target={"_blank"}>Better Go
                    Playground</a>.
                </p>

                <Divider horizontal={true}/>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                <Button size={"xs"}
                        as={Link}
                        gradientMonochrome={"teal"}
                        className={"hover:opacity-80"}
                        to={"mailto:wentianqi77@outlook.com"}
                        target={"_blank"}
                >
                    <div className={"flex items-center gap-2"}>
                        <MailIcon size={20}/>
                        Contact me
                    </div>
                </Button>
            </div>
        </Modal.Body>
    </Modal>
}
