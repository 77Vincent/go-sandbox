import {ReactNode} from 'react';

export function Button(props: {
    onClick?: () => void;
    active?: boolean;
    children: ReactNode;
    className?: string;
}) {
    const className = `hover:opacity-80 cursor px-4 py-1.5 text-white bg-blue-500 rounded-md shadow-sm${props.className || ""} ${props.active ? "" : "bg-gray-200"}`;

    return (
        <button
            className={className}
            onClick={props.onClick}>
            {props.children}
        </button>
    )
}
