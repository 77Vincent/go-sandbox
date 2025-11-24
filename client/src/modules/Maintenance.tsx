
export default function Component() {
    return (
        <div className="absolute w-full h-full z-50 flex items-center justify-center min-h-screen bg-gray-900 bg-opacity-50">
            <div className="p-4 bg-white rounded shadow w-11/12 max-w-xl">
                <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <img src={"/favicon-512x512.png"} alt={"logo"} className={"h-5"} />
                    <span> Go Sandbox needs support </span>
                </h1>
                <p className="mb-4 font-semibold"> The site is currently not usable.</p>
                <p className="mb-4">
                    There are several issues in the current implementation that can occassionally crash the service.
                    Your support will be greatly appreciated.
                </p>
                <a href="https://github.com/77Vincent/go-sandbox" target="_blank" rel="noopener noreferrer"
                    className="inline-block px-4 py-1 bg-orange-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Source Code
                </a>
            </div>
        </div>
    );
}