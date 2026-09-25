"use client";

import { useEffect, useState } from "react";
import { useAppStore, MERCHANTS } from "@/lib/store";
import {
  SPOT_INCREMENT,
  PAYMENT_METHODS,
  positionForPrice,
  type MerchantProfile,
  type PaymentMethod,
} from "@/lib/data";
import { BrandLogo } from "./BrandLogo";

type Step = "bid" | "details" | "pay" | "done";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[6-9]\d{9}$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}$/;

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between">
        <span className="text-[11.5px] font-semibold">{label}</span>
        {hint && <span className="text-[10.5px] text-text-soft">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[10.5px] font-semibold text-warn">{error}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[13.5px] outline-none focus-visible:border-accent";

/**
 * Bid → business details → payment → receipt. Deliberately a mock checkout:
 * card numbers are validated for shape only, never stored or persisted —
 * only the method and last four reach the receipt.
 */
export function BidCheckout({
  merchantId,
  minimumPrice,
  targetLabel,
  onClose,
}: {
  merchantId: string;
  minimumPrice: number;
  targetLabel: string;
  onClose: () => void;
}) {
  const boardBids = useAppStore((s) => s.boardBids);
  const savedProfile = useAppStore((s) => s.merchantProfiles[merchantId]);
  const saveMerchantProfile = useAppStore((s) => s.saveMerchantProfile);
  const placeBoardBid = useAppStore((s) => s.placeBoardBid);

  const merchant = MERCHANTS.find((m) => m.id === merchantId)!;

  const [step, setStep] = useState<Step>("bid");
  const [price, setPrice] = useState(minimumPrice);
  const [profile, setProfile] = useState<MerchantProfile>(
    savedProfile ?? { contactName: "", businessEmail: "", phone: "", gstin: "" }
  );
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [bank, setBank] = useState("HDFC Bank");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [outcome, setOutcome] = useState<{ ok: boolean; message: string; position?: number } | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !processing) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, processing]);

  const landsAt = positionForPrice(boardBids, price, merchantId);
  const currentBid = boardBids[merchantId]?.price ?? 0;

  function validateDetails() {
    const next: Record<string, string> = {};
    if (profile.contactName.trim().length < 2) next.contactName = "Who should we invoice?";
    if (!EMAIL.test(profile.businessEmail)) next.businessEmail = "Enter a valid email";
    if (!PHONE.test(profile.phone.replace(/\s/g, ""))) next.phone = "10-digit Indian mobile";
    if (profile.gstin && !GSTIN.test(profile.gstin.toUpperCase())) next.gstin = "That GSTIN doesn't look right";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validatePayment() {
    const next: Record<string, string> = {};
    if (method === "upi" && !/^[\w.-]{3,}@[a-zA-Z]{3,}$/.test(upiId)) next.upiId = "Looks like name@bank";
    if (method === "card") {
      const digits = card.number.replace(/\s/g, "");
      if (digits.length < 12 || !/^\d+$/.test(digits)) next.number = "16 digits";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) next.expiry = "MM/YY";
      if (!/^\d{3,4}$/.test(card.cvv)) next.cvv = "3 digits";
      if (card.name.trim().length < 2) next.name = "Name on card";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submitPayment() {
    if (!validatePayment()) return;
    setProcessing(true);

    // Only a masked reference ever leaves this component.
    const reference =
      method === "upi"
        ? `UPI · ${upiId}`
        : method === "card"
          ? `Card ···· ${card.number.replace(/\s/g, "").slice(-4)}`
          : `Netbanking · ${bank}`;

    window.setTimeout(() => {
      saveMerchantProfile(merchantId, { ...profile, gstin: profile.gstin?.toUpperCase() || undefined });
      const res = placeBoardBid(merchantId, price, { method, reference });
      setOutcome(res);
      setProcessing(false);
      setStep("done");
    }, 1100);
  }

  const steps: Step[] = ["bid", "details", "pay"];
  const stepIndex = steps.indexOf(step);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Place a board bid"
      onClick={(e) => {
        if (e.target === e.currentTarget && !processing) onClose();
      }}
    >
      <div className="modal-panel">
        {!processing && (
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        )}

        <div className="border-b border-border px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="md" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] tracking-wide text-text-soft uppercase">Bidding as</div>
              <div className="truncate text-[14.5px] font-semibold">{merchant.name}</div>
            </div>
          </div>

          {step !== "done" && (
            <div className="mt-4 flex items-center gap-1.5">
              {["Your bid", "Business details", "Payment"].map((label, i) => (
                <div key={label} className="flex flex-1 items-center gap-1.5">
                  <span
                    className={`mono grid h-5 w-5 flex-none place-items-center rounded-full text-[10px] font-bold ${
                      i <= stepIndex ? "text-white" : "bg-surface-sunken text-text-soft"
                    }`}
                    style={i <= stepIndex ? { background: "var(--accent)" } : undefined}
                  >
                    {i + 1}
                  </span>
                  <span className={`truncate text-[10.5px] ${i === stepIndex ? "font-semibold" : "text-text-soft"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-5">
          {/* ---------- step 1: bid ---------- */}
          {step === "bid" && (
            <>
              <p className="mb-4 text-[12.5px] text-text-soft">
                {targetLabel} Bids are final and non-refundable — if someone outbids you
                later, your position drops and the money stays spent.
              </p>

              <Field label="Your bid" hint={currentBid ? `currently ₹${currentBid}` : "one bid per brand"}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPrice((p) => Math.max(minimumPrice, p - SPOT_INCREMENT))}
                    className="h-10 w-10 flex-none rounded-xl border border-border text-[16px] font-bold hover:border-accent"
                    aria-label="Lower bid"
                  >
                    −
                  </button>
                  <div className={`${inputClass} mono flex items-center text-[17px] font-bold`}>₹{price}</div>
                  <button
                    onClick={() => setPrice((p) => p + SPOT_INCREMENT)}
                    className="h-10 w-10 flex-none rounded-xl border border-border text-[16px] font-bold hover:border-accent"
                    aria-label="Raise bid"
                  >
                    +
                  </button>
                </div>
              </Field>

              <div className="mt-3 rounded-xl bg-surface-sunken px-4 py-3 text-center">
                <div className="text-[11px] tracking-wide text-text-soft uppercase">This lands you at</div>
                <div className="stat-num mt-1 text-[30px] text-accent-deep">#{landsAt}</div>
                <div className="mt-1 text-[11px] text-text-soft">
                  Minimum to move is ₹{minimumPrice} · steps of ₹{SPOT_INCREMENT}
                </div>
              </div>

              <button
                onClick={() => setStep("details")}
                className="btn-primary mt-5 w-full rounded-full py-3 text-[13.5px] font-semibold"
              >
                Continue · ₹{price}
              </button>
            </>
          )}

          {/* ---------- step 2: details ---------- */}
          {step === "details" && (
            <>
              <p className="mb-4 text-[12.5px] text-text-soft">
                We invoice these details and use them to reach you when a customer redeems.
                {savedProfile && " Saved from your last bid — edit if anything's changed."}
              </p>

              <div className="flex flex-col gap-3">
                <Field label="Contact name" error={errors.contactName}>
                  <input
                    className={inputClass}
                    value={profile.contactName}
                    onChange={(e) => setProfile({ ...profile, contactName: e.target.value })}
                    placeholder="Who runs this account"
                  />
                </Field>
                <Field label="Business email" error={errors.businessEmail}>
                  <input
                    className={inputClass}
                    value={profile.businessEmail}
                    onChange={(e) => setProfile({ ...profile, businessEmail: e.target.value })}
                    placeholder="billing@yourbrand.in"
                    inputMode="email"
                  />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input
                    className={inputClass}
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="9876543210"
                    inputMode="tel"
                  />
                </Field>
                <Field label="GSTIN" hint="optional" error={errors.gstin}>
                  <input
                    className={inputClass}
                    value={profile.gstin ?? ""}
                    onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
                    placeholder="29ABCDE1234F1Z5"
                  />
                </Field>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setStep("bid")}
                  className="rounded-full border border-border px-5 py-3 text-[13px] font-semibold hover:border-accent"
                >
                  Back
                </button>
                <button
                  onClick={() => validateDetails() && setStep("pay")}
                  className="btn-primary flex-1 rounded-full py-3 text-[13.5px] font-semibold"
                >
                  Continue to payment
                </button>
              </div>
            </>
          )}

          {/* ---------- step 3: payment ---------- */}
          {step === "pay" && (
            <>
              <div className="mb-4 rounded-xl border border-warn bg-warn-soft px-3.5 py-2.5 text-[11.5px] font-semibold text-warn">
                Test mode — no payment is actually taken. Don&rsquo;t enter real card details.
              </div>

              <div className="mb-4 flex items-center justify-between rounded-xl bg-surface-sunken px-4 py-3">
                <span className="text-[12.5px] text-text-soft">Board position #{landsAt}</span>
                <span className="mono text-[18px] font-bold text-accent-deep">₹{price}</span>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`rounded-xl border px-2 py-2.5 text-center text-[12px] font-semibold transition-colors ${
                      method === m.id ? "border-accent bg-surface-sunken text-accent-deep" : "border-border hover:border-accent"
                    }`}
                  >
                    {m.label}
                    <span className="mt-0.5 block text-[9.5px] font-normal text-text-soft">{m.hint}</span>
                  </button>
                ))}
              </div>

              {method === "upi" && (
                <Field label="UPI ID" error={errors.upiId}>
                  <input
                    className={inputClass}
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourbrand@okhdfcbank"
                  />
                </Field>
              )}

              {method === "card" && (
                <div className="flex flex-col gap-3">
                  <Field label="Card number" hint="test only" error={errors.number}>
                    <input
                      className={`${inputClass} mono`}
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value })}
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                      autoComplete="off"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry" error={errors.expiry}>
                      <input
                        className={`${inputClass} mono`}
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                        placeholder="12/29"
                        autoComplete="off"
                      />
                    </Field>
                    <Field label="CVV" error={errors.cvv}>
                      <input
                        className={`${inputClass} mono`}
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                        placeholder="123"
                        autoComplete="off"
                      />
                    </Field>
                  </div>
                  <Field label="Name on card" error={errors.name}>
                    <input
                      className={inputClass}
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      autoComplete="off"
                    />
                  </Field>
                </div>
              )}

              {method === "netbanking" && (
                <Field label="Bank">
                  <select className={inputClass} value={bank} onChange={(e) => setBank(e.target.value)}>
                    {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra"].map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </Field>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setStep("details")}
                  disabled={processing}
                  className="rounded-full border border-border px-5 py-3 text-[13px] font-semibold hover:border-accent"
                >
                  Back
                </button>
                <button
                  onClick={submitPayment}
                  disabled={processing}
                  className="btn-primary flex-1 rounded-full py-3 text-[13.5px] font-semibold"
                >
                  {processing ? "Taking payment…" : `Pay ₹${price} and place bid`}
                </button>
              </div>
            </>
          )}

          {/* ---------- receipt ---------- */}
          {step === "done" && outcome && (
            <div className="pop-in text-center">
              <div className="text-[40px]">{outcome.ok ? "✅" : "⚠️"}</div>
              <h2 className="mt-2 text-[20px] font-semibold">
                {outcome.ok ? `You're at #${outcome.position}` : "Bid not placed"}
              </h2>
              <p className="mx-auto mt-1.5 max-w-[36ch] text-[12.5px] text-text-soft">{outcome.message}</p>

              {outcome.ok && (
                <div className="mt-5 rounded-xl bg-surface-sunken px-4 py-3.5 text-left">
                  <div className="mb-2 text-[11px] tracking-wide text-text-soft uppercase">Receipt</div>
                  <div className="flex justify-between py-1 text-[12.5px]">
                    <span className="text-text-soft">Amount</span>
                    <span className="mono font-bold">₹{price}</span>
                  </div>
                  <div className="flex justify-between py-1 text-[12.5px]">
                    <span className="text-text-soft">Method</span>
                    <span className="font-semibold capitalize">{method}</span>
                  </div>
                  <div className="flex justify-between py-1 text-[12.5px]">
                    <span className="text-text-soft">Invoiced to</span>
                    <span className="truncate font-semibold">{profile.businessEmail}</span>
                  </div>
                </div>
              )}

              <button onClick={onClose} className="btn-primary mt-5 w-full rounded-full py-3 text-[13.5px] font-semibold">
                Back to the board
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
