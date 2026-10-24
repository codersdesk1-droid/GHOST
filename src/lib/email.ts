import "server-only";
import { Resend } from "resend";
import { db } from "@/prisma/db";
import { formatCents } from "./orders";
import { getSettings } from "./settings";

/**
 * Order emails through Resend. Without RESEND_API_KEY they are skipped (and logged),
 * so checkout never fails because of email. Each email is sent at most once per order.
 *
 * Sender: EMAIL_FROM (e.g. "Ghost <orders@yourdomain.com>", on a domain verified in Resend).
 * Until a domain is verified, Resend's test sender only delivers to your own Resend account email.
 */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function load(orderId: number) {
  return db.orm.public.Order.where({ id: orderId }).include("items").first();
}

function layout(storeName: string, title: string, body: string, contactEmail: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f2ed;font-family:Helvetica,Arial,sans-serif;color:#151a1a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td style="font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#6c706c">${esc(storeName)}</td></tr>
<tr><td style="padding-top:12px;font-size:28px;line-height:1.2;font-family:Georgia,serif">${esc(title)}</td></tr>
<tr><td style="padding-top:20px;font-size:15px;line-height:1.6">${body}</td></tr>
${contactEmail ? `<tr><td style="padding-top:28px;font-size:13px;color:#6c706c">Questions? Reply to this email or write to ${esc(contactEmail)}.</td></tr>` : ""}
</table></td></tr></table></body></html>`;
}

function itemsTable(items: { productName: string; color: string; size: string; quantity: number; unitPriceCents: number }[]) {
  const rows = items
    .map(
      (i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${i.quantity} × ${esc(i.productName)}<br><span style="color:#6c706c;font-size:13px">${esc(i.color)} · ${esc(i.size)}</span></td>
<td align="right" style="padding:8px 0;border-bottom:1px solid #eee">${formatCents(i.unitPriceCents * i.quantity)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px">${rows}</table>`;
}

async function send(to: string, subject: string, html: string, replyTo: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[email] RESEND_API_KEY not set; skipped "${subject}" to ${to}`);
    return false;
  }
  const settings = await getSettings();
  const from = process.env.EMAIL_FROM || `${settings.storeName} <onboarding@resend.dev>`;
  const { error } = await new Resend(key).emails.send({ from, to, subject, html, ...(replyTo ? { replyTo } : {}) });
  if (error) {
    console.error(`[email] "${subject}" to ${to} failed:`, error.message);
    return false;
  }
  return true;
}

export async function sendOrderConfirmation(orderId: number) {
  const order = await load(orderId);
  if (!order?.email || order.confirmationEmailAt) return false;
  const s = await getSettings();
  const body = `<p>Thanks for your order. We&rsquo;re getting it ready and it ships within 1 to 2 business days.</p>
<p style="color:#6c706c;font-size:13px">Order ${esc(order.number)}</p>
${itemsTable(order.items)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;font-size:14px">
<tr><td style="color:#6c706c">Shipping</td><td align="right">${order.shippingCents ? formatCents(order.shippingCents) : "Free"}</td></tr>
<tr><td style="padding-top:6px"><strong>Total</strong></td><td align="right" style="padding-top:6px"><strong>${formatCents(order.totalCents)}</strong></td></tr></table>
${order.shippingName ? `<p style="margin-top:20px;font-size:14px;color:#6c706c">Shipping to ${esc(order.shippingName)}</p>` : ""}`;
  const sent = await send(order.email, `Order ${order.number} confirmed`, layout(s.storeName, "It's yours.", body, s.contactEmail), s.contactEmail);
  if (sent) await db.orm.public.Order.where({ id: order.id }).update({ confirmationEmailAt: new Date().toISOString() });
  return sent;
}

export async function sendShippedEmail(orderId: number) {
  const order = await load(orderId);
  if (!order?.email || order.shippedEmailAt) return false;
  const s = await getSettings();
  const body = `<p>Your order ${esc(order.number)} is on its way.</p>
${order.trackingNumber ? `<p>Tracking number: <strong>${esc(order.trackingNumber)}</strong></p>` : ""}
${itemsTable(order.items)}`;
  const sent = await send(order.email, `Order ${order.number} has shipped`, layout(s.storeName, "On its way.", body, s.contactEmail), s.contactEmail);
  if (sent) await db.orm.public.Order.where({ id: order.id }).update({ shippedEmailAt: new Date().toISOString() });
  return sent;
}
