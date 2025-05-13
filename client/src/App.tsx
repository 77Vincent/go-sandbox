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
    isMobileDevice,
    getFontSize,
    getOpenedDrawer, getCodeContent, getSourceId, getSnippetId, getDefaultFileUri, getShowTerminal
} from "./utils.ts";
import {
    SANDBOX_ID_KEY,
    FONT_SIZE_KEY,
    GO_VERSION_KEY,
    LANGUAGE_KEY,
    OPENED_DRAWER_KEY,
    DEBOUNCE_TIME_LONG, SHOW_TERMINAL_KEY
} from "./constants.ts";
import {languages, mySandboxes, selectableDrawers} from "./types";
import debounce from "debounce";

// init values
const isMobile = isMobileDevice();
const snippetId = getSnippetId();
const sourceId = getSourceId();
const initSandboxId = getSandboxId()
const initGoVersion = getGoVersion()
const initLan = getLanguage()
const initFile = getDefaultFileUri()
const initFontSize = getFontSize()
const initShowTerminal = getShowTerminal()
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
    const [showTerminal, setShowTerminal] = useState(initShowTerminal);
    const [goVersion] = useState(initGoVersion);
    const [sandboxId] = useState<mySandboxes>(initSandboxId);

    // editor state
    const [file, setFile] = useState(initFile);
    const [value, setValue] = useState<string>(initValue);

    // debounced function
    const debouncedStoreValue = debounce(useCallback((v: string) => {
        localStorage.setItem(sandboxId, v);
    }, [sandboxId]), DEBOUNCE_TIME_LONG);

    // storable state
    const updateShowTerminal = useCallback((show: boolean) => {
        setShowTerminal(show);
        localStorage.setItem(SHOW_TERMINAL_KEY, show.toString());
    }, []);
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
        debouncedStoreValue(v);
    }, [debouncedStoreValue]);

    return (
        <AppCtx.Provider value={{
            isMobile,
            sourceId,
            snippetId,
            // runtime status
            isRunning, setIsRunning,
            file, setFile,
            value, updateValue,
            // settings
            showTerminal, updateShowTerminal,
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
                                <Main/>
                            }/>
                        </Routes>
                    </main>
                </Flowbite>
            </BrowserRouter>
        </AppCtx.Provider>
    );
}

export default App;
