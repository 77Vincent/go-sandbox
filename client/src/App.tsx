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
    getOpenedDrawer, getCodeContent, isUserCode
} from "./utils.ts";
import {
    SANDBOX_ID_KEY,
    FONT_SIZE_KEY,
    GO_VERSION_KEY,
    LANGUAGE_KEY,
    OPENED_DRAWER_KEY,
    SANDBOX_TEMP, DEBOUNCE_TIME
} from "./constants.ts";
import {languages, mySandboxes, selectableDrawers} from "./types";
import debounce from "debounce";

const initSandboxId = getSandboxId()
const initGoVersion = getGoVersion()
const initLan = getLanguage()
const initFile = getFileUri(initGoVersion)
const initFontSize = getFontSize()
const initOpenedDrawer = getOpenedDrawer();
const initValue = getCodeContent(initSandboxId)

function App() {
    const [toastError, setToastError] = useState<ReactNode>(null);
    const [toastInfo, setToastInfo] = useState<ReactNode>(null);

    // status
    const [isRunning, setIsRunning] = useState(false);
    const [openedDrawer, setOpenedDrawer] = useState(initOpenedDrawer);

    // settings
    const [lan, setLan] = useState(initLan);
    const [fontSize, setFontSize] = useState(initFontSize);
    const [goVersion] = useState(initGoVersion);
    const [sandboxId] = useState<mySandboxes>(initSandboxId);

    // editor state
    const [file, setFile] = useState(initFile);
    const [value, setValue] = useState<string>(initValue);

    // debounced function
    const debouncedStoreValue = debounce(useCallback((v: string) => {
        localStorage.setItem(sandboxId, v);
    }, [sandboxId]), DEBOUNCE_TIME);

    const updateOpenedDrawer = useCallback((id: selectableDrawers) => {
        setOpenedDrawer(id);
        localStorage.setItem(OPENED_DRAWER_KEY, id);
    }, []);

    const updateFontSize = useCallback((size: number) => {
        setFontSize(size);
        localStorage.setItem(FONT_SIZE_KEY, size.toString());
    }, []);

    const updateLan = useCallback((lan: languages) => {
        setLan(lan);
        localStorage.setItem(LANGUAGE_KEY, lan);
    }, []);
    const updateGoVersion = useCallback((version: string) => {
        localStorage.setItem(GO_VERSION_KEY, version);
        window.location.href = window.location.origin // remove all paths and query string
    }, []);
    const updateSandboxId = useCallback((id: mySandboxes) => {
        localStorage.setItem(SANDBOX_ID_KEY, id);
        window.location.href = window.location.origin // remove all paths and query string
    }, []);
    const updateValue = useCallback((v: string) => {
        setValue(v);
        if (isUserCode(file)) {
            debouncedStoreValue(v);
        }
    }, [debouncedStoreValue, file]);

    return (
        <AppCtx.Provider value={{
            isMobile: isMobileDevice(),
            // runtime status
            isRunning, setIsRunning,
            file, setFile,
            value, updateValue,
            // settings
            openedDrawer, updateOpenedDrawer,
            lan, updateLan,
            fontSize, updateFontSize,
            goVersion, updateGoVersion,
            sandboxId, updateSandboxId,
            // toast
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
