import Main from "./modules/Main.tsx";
import {ReactNode, useEffect, useState} from "react";
import {healthCheck} from "./api/api.ts";
import {BrowserRouter} from "react-router-dom";
import {MyToast} from "./modules/Common.tsx";
import {Flowbite} from "flowbite-react";
import {getGoVersion, getSandboxId} from "./utils.ts";

const initialSandboxId = getSandboxId()
const initialGoVersion = getGoVersion()

function App() {
    const [toastError, setToastError] = useState<ReactNode>(null);
    const [toastInfo, setToastInfo] = useState<ReactNode>(null);

    useEffect(() => {
        (async () => {
            try {
                await healthCheck();
            } catch (e) {
                setToastError(`No backend connection: ${(e as Error).message}`);
            }
        })();
    }, []);

    return (
        <BrowserRouter>
            <Flowbite theme={{mode: "dark"}}>
                <main>
                    <MyToast type={"error"} show={!!toastError} setShowToast={setToastError}>{toastError}</MyToast>
                    <MyToast type={"info"} show={!!toastInfo} setShowToast={setToastInfo}>{toastInfo}</MyToast>

                    <Main
                        sandboxId={initialSandboxId} goVersion={initialGoVersion}
                        setToastInfo={setToastInfo} setToastError={setToastError}/>
                </main>
            </Flowbite>
        </BrowserRouter>
    );
}

export default App;
