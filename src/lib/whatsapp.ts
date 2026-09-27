import type { CartItem } from "@/types";

type WhatsAppOrderInput = {
  restaurantName: string;
  whatsappNumber: string;
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee?: number;
  address?: string;
  notes?: string;
  currency?: string;
};

export function buildWhatsAppOrderUrl(input: WhatsAppOrderInput) {
  const {
    restaurantName,
    whatsappNumber,
    customerName,
    customerPhone,
    orderNumber,
    items,
    subtotal,
    deliveryFee = 0,
    address,
    notes,
    currency = "GHS"
  } = input;

  const total = subtotal + deliveryFee;

  const lines = [
    `Hello ${restaurantName}.`,
    "",
    `Order #${orderNumber}`,
    "",
    ...items.map(
      (item) =>
        `${item.quantity}x ${item.name} - ${currency} ${(
          item.price * item.quantity
        ).toFixed(2)}`
    ),
    "",
    `Subtotal: ${currency} ${subtotal.toFixed(2)}`,
    `Delivery: ${currency} ${deliveryFee.toFixed(2)}`,
    `Total: ${currency} ${total.toFixed(2)}`,
    "",
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    address ? `Address: ${address}` : "",
    notes ? `Notes: ${notes}` : ""
  ].filter(Boolean);

  const phone = whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
