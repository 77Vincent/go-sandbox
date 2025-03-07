import Editor from "./modules/Editor";
import {useEffect} from "react";
import {healthCheck} from "./api/api.ts";


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
        <main>
            <Editor/>
        </main>
    );
}

export default App;
