import Editor from "./modules/Editor";
import {useEffect, useState} from "react";
import {healthCheck} from "./api/api.ts";
import {BrowserRouter} from "react-router-dom";
import {MyToast} from "./modules/Common.tsx";


function App() {
    const [toastMessage, setToastMessage] = useState<string>("");

    useEffect(() => {
        (async () => {
            try {
                await healthCheck();
                console.log("backend api connected");
            } catch (e) {
                setToastMessage(`No backend connection: ${(e as Error).message}`);
            }
        })();
    }, []);

    return (
        <BrowserRouter>
            <main>
                <MyToast show={!!toastMessage} setShowToast={setToastMessage}>{toastMessage}</MyToast>

                <Editor setToastMessage={setToastMessage}/>
            </main>
        </BrowserRouter>
    );
}

export default App;
