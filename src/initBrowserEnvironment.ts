import * as enzyme from "enzyme";
// @ts-ignore - Can't figure out how to fix this TS warning
import Adapter from "enzyme-adapter-react-16";
import {JSDOM} from "jsdom";

// Following declarations are here to maintain type safety of JSON initialization
interface ResizableTestingWindow extends Window {
    innerWidth: number;
    innerHeight: number;
}

declare global {
    namespace NodeJS {
        interface Global {
            document: Document;
            window: ResizableTestingWindow | null;
            navigator: Navigator | null;
            location: Location | null;
        }
    }
}

const {document} = (new JSDOM("<!doctype html><html lang=\"en\"><body><div id=\"root\"/></body></html>")).window;
global.document = document;
global.window = document.defaultView;

// Simulate window resize event
const resizeEvent = new window.Event("resize");

if (global.window) {
    global.navigator = global.window.navigator;
    global.location = global.window.location;
    const window = global.window;
    window.resizeTo = (width: number, height: number) => {
        window.innerWidth = width ||  window.innerWidth;
        window.innerHeight = height ||  window.innerHeight;
        window.dispatchEvent(resizeEvent);
    };
}

enzyme.configure({ adapter: new Adapter() });
