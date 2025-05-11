import Main from "./modules/Main.tsx";
import {ReactNode, useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {MyToast} from "./modules/Common.tsx";
import {Flowbite} from "flowbite-react";
import {getGoVersion, getSandboxId, AppCtx, getLanguage, getFileUri, isMobileDevice} from "./utils.ts";
import {SANDBOX_TEMP} from "./constants.ts";
import {mySandboxes} from "./types";

const initialSandboxId = getSandboxId()
const initialGoVersion = getGoVersion()
const initialLan = getLanguage()
const initialFile = getFileUri(initialGoVersion)

function App() {
    const [toastError, setToastError] = useState<ReactNode>(null);
    const [toastInfo, setToastInfo] = useState<ReactNode>(null);

    const [isRunning, setIsRunning] = useState(false);
    const [lan, setLan] = useState(initialLan);
    const [file, setFile] = useState(initialFile);
    const [goVersion, setGoVersion] = useState(initialGoVersion);
    const [sandboxId, setSandboxId] = useState<mySandboxes>(initialSandboxId);

    return (
        <AppCtx.Provider value={{
            isMobile: isMobileDevice(),
            isRunning, setIsRunning,
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
                                <Main sandboxId={initialSandboxId}/>
                            }/>
                            <Route path="/snippets/:id" element={
                                <Main sandboxId={SANDBOX_TEMP}/>
                            }/>
                        </Routes>
                    </main>
                </Flowbite>
            </BrowserRouter>
        </AppCtx.Provider>
    );
}

export default App;
