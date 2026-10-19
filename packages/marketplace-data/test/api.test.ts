import assert from "node:assert/strict";
import test from "node:test";
import { createMarketplaceApi } from "../src/api.js";

const inventory = {
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

test("API wrapper returns validated response DTOs", async () => {
  const api = createMarketplaceApi({
    baseUrl: "https://api.example.test/",
    fetchImpl: async () => new Response(JSON.stringify(inventory), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  });

  const result = await api.getSellerInventory("seller-01");
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.items.length, 1);
});

test("API wrapper returns a safe validation error when upstream shape drifts", async () => {
  const api = createMarketplaceApi({
    baseUrl: "https://api.example.test",
    fetchImpl: async () => new Response(JSON.stringify({ unexpected: "private upstream payload" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  });

  const result = await api.getSellerInventory("seller-01");
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "INVALID_RESPONSE");
    assert.doesNotMatch(result.error.message, /private upstream payload/);
  }
});

test("API wrapper safely maps upstream HTTP errors", async () => {
  const api = createMarketplaceApi({
    baseUrl: "https://api.example.test",
    fetchImpl: async () => new Response(JSON.stringify({ secret: "do not expose" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    }),
  });

  const result = await api.getSellerInventory("seller-01");
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "HTTP_ERROR");
    assert.equal(result.error.message, "The service is temporarily unavailable. Please try again.");
  }
});
