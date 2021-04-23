import { enableMapSet } from "immer";
import "@testing-library/jest-dom/extend-expect";

// TODO: enableMapSet is needed to workaround draft-js type issue.
//  https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43426
//  Can be removed once fixed.
enableMapSet();
