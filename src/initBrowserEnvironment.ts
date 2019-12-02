import * as enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import {JSDOM} from "jsdom";

// Following declarations are here to maintain type safety of JSON initialization
interface ResizableTestingWindow extends Window {
    innerWidth: number;
    innerHeight: number;
}

new JSDOM("<!doctype html><html lang=\"en\"><body><div id=\"root\"/></body></html>");


// @ts-ignore We need to make window resizable for test purposes - kind of
const window = global.window as ResizableTestingWindow;
const resizeEvent = new Event("resize");
window.resizeTo = (width: number, height: number): void => {
    window.innerWidth = width ||  window.innerWidth;
    window.innerHeight = height ||  window.innerHeight;
    window.dispatchEvent(resizeEvent);
};

enzyme.configure({ adapter: new Adapter() });
