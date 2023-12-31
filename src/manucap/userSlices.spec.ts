import { User } from "./model";
import { updateCaptionUser } from "./userSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { createTestingStore } from "../testUtils/testingStore";

const testingUser = {
    displayName: "Test User",
    email: "test@gmail.com",
    firstname: "Test",
    lastname: "User",
    systemAdmin: "",
    userId: "test"
} as User;

const testingStore = createTestingStore();

describe("userSlices", () => {
    it("update captionUser", () => {
        expect(testingStore.getState().captionUser).not.toEqual(testingUser);

        // WHEN
        testingStore.dispatch(updateCaptionUser(testingUser) as {} as AnyAction);

        // THEN
        expect(testingStore.getState().captionUser).toEqual(testingUser);
    });
});
