import {Button, Modal} from "flowbite-react";

export default function Component(props: {
    show: boolean,
    setShow: (show: boolean) => void,
}) {
    const {show, setShow} = props

    return <Modal dismissible show={show} onClose={() => setShow(false)}>
        <Modal.Header> About </Modal.Header>
        <Modal.Body>
            <Button gradientDuoTone={"purpleToBlue"} href={"https://www.buymeacoffee.com/"} target={"_blank"}>
                Buy me a coffee (1$)
            </Button>
        </Modal.Body>
    </Modal>
}
