import assert from "node:assert/strict";
import test from "node:test";
import {
  customerProfileSchema,
  sellerInventorySchema,
} from "../src/schemas.js";

const validInventory = {
  sellerId: "seller-01",
  generatedAt: "2026-10-19T10:00:00.000Z",
  items: [
    {
      id: "milk-1",
      sellerId: "seller-01",
      name: "Cow milk",
      unit: "litre",
      price: { amountPaise: 6500, currency: "INR" },
      available: true,
      quantityAvailable: 40,
      updatedAt: "2026-10-19T09:55:00.000Z",
    },
  ],
};

test("seller inventory accepts a valid inventory", () => {
  const parsed = sellerInventorySchema.safeParse(validInventory);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.items[0]?.price.amountPaise, 6500);
  }
});

test("seller inventory rejects items owned by another seller", () => {
  const payload = {
    ...validInventory,
    items: [{ ...validInventory.items[0], sellerId: "seller-02" }],
  };
  assert.equal(sellerInventorySchema.safeParse(payload).success, false);
});

test("seller inventory rejects duplicate item identifiers", () => {
  const first = validInventory.items[0];
  const payload = { ...validInventory, items: [first, { ...first, name: "Buffalo milk" }] };
  assert.equal(sellerInventorySchema.safeParse(payload).success, false);
});

test("customer profile validates Indian postal code and E.164 phone", () => {
  const validProfile = {
    id: "customer-01",
    displayName: "A Customer",
    phoneE164: "+919876543210",
    defaultAddress: {
      label: "Home",
      addressLine: "12 Sample Road",
      area: "Bhadaj",
      city: "Ahmedabad",
      postalCode: "382421",
    },
    createdAt: "2026-10-19T10:00:00.000Z",
  };
  assert.equal(customerProfileSchema.safeParse(validProfile).success, true);
  assert.equal(
    customerProfileSchema.safeParse({ ...validProfile, defaultAddress: { ...validProfile.defaultAddress, postalCode: "01234" } }).success,
    false,
  );
});
