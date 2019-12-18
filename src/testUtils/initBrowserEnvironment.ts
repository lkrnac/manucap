import * as enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import {JSDOM} from "jsdom";

new JSDOM("<!doctype html><html lang=\"en\"><body><div id=\"root\"/></body></html>");

enzyme.configure({ adapter: new Adapter() });
