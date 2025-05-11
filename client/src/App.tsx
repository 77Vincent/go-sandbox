import Main from "./modules/Main.tsx";
import {ReactNode, useCallback, useState} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {MyToast} from "./modules/Common.tsx";
import {Flowbite} from "flowbite-react";
import {
    getGoVersion,
    getSandboxId,
    AppCtx,
    getLanguage,
    getFileUri,
    isMobileDevice,
    getFontSize,
    getOpenedDrawer
} from "./utils.ts";
import {FONT_SIZE_KEY, OPENED_DRAWER_KEY, SANDBOX_TEMP} from "./constants.ts";
import {mySandboxes, selectableDrawers} from "./types";

const initSandboxId = getSandboxId()
const initGoVersion = getGoVersion()
const initLan = getLanguage()
const initFile = getFileUri(initGoVersion)
const initFontSize = getFontSize()
const initOpenedDrawer = getOpenedDrawer();

function App() {
    const [toastError, setToastError] = useState<ReactNode>(null);
    const [toastInfo, setToastInfo] = useState<ReactNode>(null);

    // status
    const [isRunning, setIsRunning] = useState(false);
    const [openedDrawer, setOpenedDrawer] = useState(initOpenedDrawer);

    // settings
    const [lan, setLan] = useState(initLan);
    const [fontSize, setFontSize] = useState(initFontSize);
    const [goVersion, setGoVersion] = useState(initGoVersion);
    const [sandboxId, setSandboxId] = useState<mySandboxes>(initSandboxId);

    // editor state
    const [file, setFile] = useState(initFile);

    const updateOpenedDrawer = useCallback((id: selectableDrawers) => {
        setOpenedDrawer(id);
        localStorage.setItem(OPENED_DRAWER_KEY, id);
    }, []);

    const updateFontSize = useCallback((size: number) => {
        setFontSize(size);
        localStorage.setItem(FONT_SIZE_KEY, size.toString());
    }, []);

    return (
        <AppCtx.Provider value={{
            isMobile: isMobileDevice(),
            isRunning, setIsRunning,
            openedDrawer, updateOpenedDrawer,
            lan, setLan,
            fontSize, updateFontSize,
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
                                <Main sandboxId={initSandboxId}/>
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
