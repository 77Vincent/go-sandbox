export default function Component(props: {
    className?: string
    show?: boolean,
}) {
    const {className, show} = props
    const classes = `w-full overflow-hidden ${className}`

    return show && (
        <div className={classes}>
            <div className={"progress-bar h-1 w-0 bg-cyan-500"}></div>
        </div>
    )
}
