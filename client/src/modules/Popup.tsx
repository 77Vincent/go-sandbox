import {ReactNode, useState} from "react";
import {Rnd} from "react-rnd";
import {Divider, IconButton, Row, Typography} from "./Common.tsx";
import {CloseIcon} from "./Icons.tsx";

const initSize = {width: 600, height: 400}
const initPos = {
    x: window.innerWidth / 2 - initSize.width / 2,
    y: window.innerHeight / 2 - initSize.height / 2,
}
const minWidth = 400
const minHeight = 300
const maxWidth = window.innerWidth - 100
const maxHeight = window.innerHeight - 100

export default function Component(props: {
    show: boolean;
    title: ReactNode;
    onClose: () => void;
    children?: ReactNode;
    className?: string;
}) {
    const {show, children, className, title, onClose} = props;

    const [pos, setPos] = useState<{ x: number; y: number }>(initPos)
    const [size, setSize] = useState<{ width: number; height: number }>(initSize)

    if (!show) {
        return null;
    }

    return (
        <Rnd
            dragHandleClassName={"rnd-drag-handle"}
            className={`z-20 border border-gray-300 bg-neutral-50 pb-11 shadow-lg dark:border-gray-600 dark:bg-neutral-800 ${className}`}
            bounds={"window"}
            onDragStop={(_, d) => {
                setPos({x: d.x, y: d.y,});
            }}
            size={{width: size.width, height: size.height}}
            onResize={(_e, _direction, ref, _delta, position) => {
                setSize({width: ref.offsetWidth, height: ref.offsetHeight,});
                setPos({x: position.x, y: position.y,});
            }}
            minWidth={minWidth} minHeight={minHeight}
            maxWidth={maxWidth} maxHeight={maxHeight}
            default={{x: pos.x, y: pos.y, width: size.width, height: size.height}}
        >
            {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
            <Row className={"rnd-drag-handle cursor-move bg-gray-200 px-2 py-1.5 dark:bg-neutral-700"}>
                <Typography variant={"h5"}>{title}</Typography>
                <IconButton onClick={onClose} icon={<CloseIcon/>}/>
            </Row>
            <Divider horizontal={true}/>

            {children}
        </Rnd>
    )
}
