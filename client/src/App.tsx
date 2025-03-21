import Editor from "./modules/Editor";
import {useEffect, useState} from "react";
import {healthCheck} from "./api/api.ts";
import {BrowserRouter} from "react-router-dom";
import {MyToast} from "./modules/Common.tsx";

function App() {
    const [toastError, setToastError] = useState<string>("");
    const [toastInfo, setToastInfo] = useState<string>("");

    useEffect(() => {
        (async () => {
            try {
                await healthCheck();
                console.log("backend api connected");
            } catch (e) {
                setToastError(`No backend connection: ${(e as Error).message}`);
            }
        })();
    }, []);

    return (
        <BrowserRouter>
            <main>
                <MyToast type={"error"} show={!!toastError} setShowToast={setToastError}>{toastError}</MyToast>
                <MyToast type={"info"} show={!!toastInfo} setShowToast={setToastInfo}>{toastInfo}</MyToast>

                <Editor setToastInfo={setToastInfo} setToastError={setToastError}/>
            </main>
        </BrowserRouter>
    );
}

export default App;
