import {Button, Modal} from "flowbite-react";
import {FaGithub} from "react-icons/fa";

import {TITLE} from "../constants.ts";
import {languages} from "../types";
import {Divider} from "./Common.tsx";
import {Link} from "react-router";

export default function Component(props: {
    show: boolean,
    lan: languages,
    setShow: (show: boolean) => void,
}) {
    const {show, setShow} = props

    return <Modal dismissible show={show} onClose={() => setShow(false)}>
        <Modal.Header>
            <div className={"flex items-center gap-2"}>
                <img src={"/logo.svg"} alt={"logo"} className={"h-5 max-md:hidden"}/>
                {TITLE}
            </div>
        </Modal.Header>

        <Modal.Body>
            <div className={"flex flex-col gap-4 font-light dark:text-gray-50"}>
                <p>
                    Go Sandbox is a minimalist and advanced online editor for Go, featuring LSP-backed linting and
                    autocompletion, and real-time execution of your code!
                </p>

                <div className={"text-lg font-semibold italic"}>Key Features</div>
                <ul className={"list-inside list-disc indent-4"}>
                    <li>Realtime execution using websocket</li>
                    <li>LSP-backed linting and autocompletion</li>
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
                {/*<Button size={"xs"}*/}
                {/*        as={Link}*/}
                {/*        className={"hover:opacity-80"}*/}
                {/*        gradientMonochrome={"cyan"}*/}
                {/*        to={""} target={"_blank"}>*/}
                {/*    <div className={"flex items-center gap-2"}>*/}
                {/*        <FaCoffee size={20}/>*/}
                {/*        {TRANSLATE.coffee[lan]}*/}
                {/*    </div>*/}
                {/*</Button>*/}

                <Button size={"xs"}
                        as={Link}
                        gradientMonochrome={"teal"}
                        className={"hover:opacity-80"}
                        to={"https://github.com/77Vincent/go-sandbox/issues"} target={"_blank"}>
                    <div className={"flex items-center gap-2"}>
                        <FaGithub size={20}/>
                        Report Issues
                    </div>
                </Button>
            </div>
        </Modal.Body>
    </Modal>
}
