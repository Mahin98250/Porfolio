import { z } from "zod";

const idSchema = z.string().trim().min(1).max(128);
const isoDateTimeSchema = z.string().datetime({ offset: true });

export const moneySchema = z.object({
  amountPaise: z.number().int().nonnegative().max(100_000_000),
  currency: z.literal("INR"),
}).strict();

export const sellerInventoryItemSchema = z.object({
  id: idSchema,
  sellerId: idSchema,
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  unit: z.enum(["litre", "500ml", "250ml", "piece"]),
  price: moneySchema,
  available: z.boolean(),
  quantityAvailable: z.number().int().nonnegative().max(100_000),
  updatedAt: isoDateTimeSchema,
}).strict();

export const sellerInventorySchema = z.object({
  sellerId: idSchema,
  items: z.array(sellerInventoryItemSchema).max(2_000),
  generatedAt: isoDateTimeSchema,
}).strict().superRefine((inventory, context) => {
  const seen = new Set<string>();
  inventory.items.forEach((item, index) => {
    if (item.sellerId !== inventory.sellerId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items", index, "sellerId"],
        message: "Inventory item sellerId does not match inventory owner",
      });
    }
    if (seen.has(item.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items", index, "id"],
        message: "Duplicate inventory item id",
      });
    }
    seen.add(item.id);
  });
});

export const customerProfileSchema = z.object({
  id: idSchema,
  displayName: z.string().trim().min(1).max(100),
  phoneE164: z.string().regex(/^\+[1-9]\d{7,14}$/),
  defaultAddress: z.object({
    label: z.string().trim().min(1).max(40),
    addressLine: z.string().trim().min(5).max(300),
    area: z.string().trim().min(1).max(100),
    city: z.string().trim().min(1).max(100),
    postalCode: z.string().regex(/^[1-9]\d{5}$/),
  }).strict().optional(),
  createdAt: isoDateTimeSchema,
}).strict();

export const apiErrorSchema = z.object({
  code: z.string().min(1).max(80),
  message: z.string().min(1).max(240),
  requestId: z.string().max(128).optional(),
}).strict();

export type Money = z.infer<typeof moneySchema>;
export type SellerInventoryItem = z.infer<typeof sellerInventoryItemSchema>;
export type SellerInventory = z.infer<typeof sellerInventorySchema>;
export type CustomerProfile = z.infer<typeof customerProfileSchema>;
export type ApiErrorPayload = z.infer<typeof apiErrorSchema>;
