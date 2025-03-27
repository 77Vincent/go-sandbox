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

        <Modal.Body>
            <div className={"flex flex-col gap-4 font-light dark:text-gray-50"}>
                <p className={"font-semibold"}>
                    Experience seamless Golang development with Go Sandbox -
                    A lightweight and advanced online editor
                    featuring syntax highlighting and automatic realtime execution of your Go programs!
                </p>


                <Divider horizontal={true}/>

                <p>
                    This project is inspired by the official
                    <a className={"mx-1 text-cyan-600"} href={"https://play.golang.org/"} target={"_blank"}>Go
                        Playground</a>
                    and another similar project
                    <a className={"mx-1 text-cyan-600"} href={"https://goplay.tools/"} target={"_blank"}>Better Go
                        Playground</a>.
                </p>

                <Divider horizontal={true}/>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
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
