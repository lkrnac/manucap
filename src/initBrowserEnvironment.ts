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
            window: ResizableTestingWindow;
            navigator: Navigator;
            location: Location;
        }
    }
}

const {document} = (new JSDOM("<!doctype html><html lang=\"en\"><body><div id=\"root\"></div></body></html>")).window;
global.document = document;
global.window = document.defaultView;
global.navigator = global.window.navigator;
global.location = global.window.location;

// Simulate window resize event
const resizeEvent = document.createEvent("Event");
resizeEvent.initEvent("resize", true, true);

const window = global.window;
window.resizeTo = (width: number, height: number) => {
    window.innerWidth = width ||  window.innerWidth;
    window.innerHeight = height ||  window.innerHeight;
    window.dispatchEvent(resizeEvent);
};
