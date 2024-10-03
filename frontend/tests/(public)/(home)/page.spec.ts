import { expect, test } from "@playwright/test";

test.describe("Homepage tests", () => {
    test("should navigate to the homepage", async ({page}) => {
        await page.goto("/")

        const headerLink = page.getByRole("button", {name: "Sign In"})
        
        await expect(headerLink).toBeVisible()
    })

    test("should redirect to the sign in page on clicking link", async ({page}) => {
        await page.goto("/")

        const headerLink = page.getByRole("button", {name: "Sign In"})
        await expect(headerLink).toBeVisible()
        await headerLink.click()

        await expect(page).toHaveURL("/sign-in")
    })
})