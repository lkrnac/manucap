import * as enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import {JSDOM} from "jsdom";

// Following declarations are here to maintain type safety of JSON initialization
interface ResizableTestingWindow extends Window {
    innerWidth: number;
    innerHeight: number;
}

declare global {
    // TODO not sure how to get rid of this ESLint suppression so far
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace NodeJS {
        interface Global {
            document: Document;
            window: ResizableTestingWindow | null;
            navigator: Navigator | null;
            location: Location | null;
        }
    }
}

new JSDOM("<!doctype html><html lang=\"en\"><body><div id=\"root\"/></body></html>");

const resizeEvent = new window.Event("resize");

if (global.window) {
    const window = global.window;
    window.resizeTo = (width: number, height: number): void => {
        window.innerWidth = width ||  window.innerWidth;
        window.innerHeight = height ||  window.innerHeight;
        window.dispatchEvent(resizeEvent);
    };
}

enzyme.configure({ adapter: new Adapter() });
