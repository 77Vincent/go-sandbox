import Editor from "./modules/Editor";
import {useEffect} from "react";
import {healthCheck} from "./api/api.ts";
import {BrowserRouter} from "react-router-dom";


function App() {
    useEffect(() => {
        (async () => {
            try {
                await healthCheck();
                console.log("backend api connected");
            } catch (e) {
                console.error("backend api connection failed");
            }
        })();
    }, []);

    return (
        <BrowserRouter>
            <main>
                <Editor/>
            </main>
        </BrowserRouter>
    );
}

export default App;
