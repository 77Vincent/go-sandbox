import Main from "./modules/Main.tsx";
import {ReactNode, useEffect, useState} from "react";
import {healthCheck} from "./api/api.ts";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {MyToast} from "./modules/Common.tsx";
import {Flowbite} from "flowbite-react";
import {getGoVersion, getSandboxId, AppCtx, getLanguage, getFileUri} from "./utils.ts";
import {SANDBOX_TEMP} from "./constants.ts";
import {mySandboxes} from "./types";

const initialSandboxId = getSandboxId()
const initialGoVersion = getGoVersion()
const initialLan = getLanguage()
const initialFile = getFileUri(initialGoVersion)

function App() {
    const [toastError, setToastError] = useState<ReactNode>(null);
    const [toastInfo, setToastInfo] = useState<ReactNode>(null);

    const [lan, setLan] = useState(initialLan);
    const [file, setFile] = useState(initialFile);
    const [goVersion, setGoVersion] = useState(initialGoVersion);
    const [sandboxId, setSandboxId] = useState<mySandboxes>(initialSandboxId);

    // health check
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
        <AppCtx.Provider value={{
            lan, setLan,
            file, setFile,
            goVersion, setGoVersion,
            sandboxId, setSandboxId,
            toastInfo, setToastInfo,
            toastError, setToastError,
        }}>
            <BrowserRouter>
                <Flowbite theme={{mode: "dark"}}>
                    <main>
                        <MyToast type={"error"} show={!!toastError} setShowToast={setToastError}>{toastError}</MyToast>
                        <MyToast type={"info"} show={!!toastInfo} setShowToast={setToastInfo}>{toastInfo}</MyToast>

                        <Routes>
                            <Route path="*" element={
                                <Main sandboxId={initialSandboxId} goVersion={initialGoVersion}/>
                            }/>
                            <Route path="/snippets/:id" element={
                                <Main sandboxId={SANDBOX_TEMP} goVersion={initialGoVersion}/>
                            }/>
                        </Routes>
                    </main>
                </Flowbite>
            </BrowserRouter>
        </AppCtx.Provider>
    );
}

export default App;
