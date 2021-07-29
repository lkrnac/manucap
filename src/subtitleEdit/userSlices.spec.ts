import { User } from "./model";
import { userSlice } from "./userSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../testUtils/testingStore";

const testingUser = {
    displayName: "Test User",
    email: "test@dotsub.com",
    firstname: "Test",
    lastname: "User",
    systemAdmin: "",
    userId: "test"
} as User;

const testingStore = createTestingStore();

describe("userSlices", () => {
    it("update currentUser", () => {
        expect(testingStore.getState().currentUser).not.toEqual(testingUser);

        // WHEN
        testingStore.dispatch(userSlice.actions.updateSubtitleUser({ currentUser: testingUser }) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().currentUser).toEqual(testingUser);
    });
});
