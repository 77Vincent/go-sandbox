import Editor from "./modules/Editor";
import {useEffect} from "react";
import {healthCheck} from "./api/api.ts";


function App() {
    useEffect(() => {
        (async () => {
            const data = await healthCheck();
            console.log(1111111, data);
        })();
    }, []);

    return (
        <main>
            <Editor/>
        </main>
    );
}

export default App;
