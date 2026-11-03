"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, ImagePlus, LoaderCircle, Sandwich, Shirt, Trash2 } from "lucide-react";

const MAX_RECEIPT_SIZE = 4 * 1024 * 1024;

const fields = [
  { name: "full_name", label: "Full name", placeholder: "e.g. John Haile", autoComplete: "name", capitalize: true },
  { name: "department", label: "Department", placeholder: "e.g. Computer Science", autoComplete: "organization-title", capitalize: true },
  { name: "year_semester", label: "Year & semester", placeholder: "e.g. Year 2 Sem 1", autoComplete: "off", capitalize: true },
  { name: "email", label: "Email address", placeholder: "you@example.com", autoComplete: "email", type: "email" },
  { name: "phone", label: "Phone number", placeholder: "+251 9XX XXX XXX", autoComplete: "tel", type: "tel" },
] as const;

function capitalizeWords(value: string) {
  return value.replace(/(^|[\s'-])(\p{L})/gu, (_match, separator: string, letter: string) =>
    `${separator}${letter.toUpperCase()}`,
  );
}

export default function RegistrationForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState("");

  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(receiptFile);
    setReceiptPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [receiptFile]);

  function selectReceipt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setReceiptFile(null);
      setSuccess(false);
      setMessage("Choose a PNG, JPEG, or WebP payment receipt image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_RECEIPT_SIZE) {
      setReceiptFile(null);
      setSuccess(false);
      setMessage("The receipt image must be 4 MB or smaller.");
      event.target.value = "";
      return;
    }
    setMessage("");
    setReceiptFile(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!receiptFile) {
      setSuccess(false);
      setMessage("Please upload a screenshot of your payment receipt before registering.");
      return;
    }
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      let receipt: { url: string; token: string } | null = null;
      if (receiptFile) {
        const upload = new FormData();
        upload.set("file", receiptFile);
        const uploadResponse = await fetch("/api/payment-receipts", { method: "POST", body: upload });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) {
          setSuccess(false);
          setMessage(uploadResult.error ?? "We couldn’t upload your receipt. Please try again.");
          return;
        }
        receipt = { url: uploadResult.url, token: uploadResult.token };
      }

      const data = Object.fromEntries(formData.entries());
      for (const field of fields) {
        const value = data[field.name];
        if ("capitalize" in field && field.capitalize && typeof value === "string") {
          data[field.name] = capitalizeWords(value);
        }
      }
      if (receipt) {
        data.payment_receipt_url = receipt.url;
        data.payment_receipt_token = receipt.token;
      }
      const response = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setSuccess(false);
        setMessage(result.error ?? "We couldn’t complete your registration. Please try again.");
        return;
      }
      setSuccess(true);
      setMessage("You’re registered! Your digital pass is ready.");
      router.push(`/ticket/${result.ticketId}`);
    } catch {
      setSuccess(false);
      setMessage("We couldn’t reach the registration service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function removeReceipt() {
    setReceiptFile(null);
    const input = document.getElementById("payment-receipt") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  return (
    <form onSubmit={submit} className="min-w-0 rounded-2xl bg-oatmeal p-5 sm:p-7 lg:p-8" noValidate>
      <div className="mb-6 border-b border-plum/20 pb-5">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Before you register</p>
        <h3 className="mt-2 text-lg font-black tracking-tight text-ink sm:text-xl">
          A few things to know
        </h3>
        <div className="mt-4 grid gap-4 text-sm leading-6 sm:grid-cols-2 sm:gap-6">
          <div className="flex items-start gap-3">
            <Shirt className="mt-0.5 h-5 w-5 shrink-0 text-plum" aria-hidden="true" />
            <p className="text-ink/75">
              <span className="font-bold text-ink">Dress code: Black &amp; White.</span>{" "}
              Please wear full black, full white, or a combination.
              {" "}ነጭ በነጭ ፣ ጥቁር በጥቁር ወይም ነጭና ጥቁር ቀላቅላችሁ መልበስ ትችላላችሁ።
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Sandwich className="mt-0.5 h-5 w-5 shrink-0 text-plum" aria-hidden="true" />
            <p className="text-ink/75">
              <span className="font-bold text-ink">Bring a snack</span> to share and enjoy during the overnight program.
            </p>
          </div>
        </div>
      </div>
      <div className="mb-5">
        <h3 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">Attendee details</h3>
        <p className="mt-1 text-sm text-ink/70">All fields are required for your event pass.</p>
      </div>
      <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-y-5">
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">{field.label}<span className="text-plum"> *</span></span>
            <input
              name={field.name}
              type={"type" in field ? field.type : "text"}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              autoCapitalize={"capitalize" in field && field.capitalize ? "words" : "none"}
              onChange={(event) => {
                if ("capitalize" in field && field.capitalize) {
                  event.currentTarget.value = capitalizeWords(event.currentTarget.value);
                }
              }}
              required
              maxLength={field.name === "full_name" ? 160 : field.name === "email" ? 254 : field.name === "department" ? 120 : 80}
              className="w-full rounded-lg border border-plum/25 bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink/55 focus:border-plum focus:ring-2 focus:ring-plum/15"
            />
          </label>
        ))}
      </div>
      <div className="mt-6">
        <label htmlFor="payment-receipt" className="mb-2 block text-sm font-semibold text-ink">
          Attach Payment Receipt / Screenshot (Telebirr / CBE / Bank)
          <span className="ml-1 text-xs font-medium text-plum">(required)</span>
        </label>
        <input
          id="payment-receipt"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={selectReceipt}
          disabled={submitting}
          className="sr-only"
        />
        {receiptFile && receiptPreview ? (
          <div className="flex flex-col gap-4 rounded-lg border border-plum/20 bg-white p-3 sm:flex-row sm:items-center">
            <img src={receiptPreview} alt="Selected payment receipt preview" className="h-36 w-full rounded-lg bg-paper object-contain sm:w-36" />
            <div className="min-w-0 flex-1">
              <p className="break-all text-sm font-semibold text-ink">{receiptFile.name}</p>
              <p className="mt-1 text-xs text-ink/65">{(receiptFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <label htmlFor="payment-receipt" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-plum/20 px-3 py-2 text-xs font-bold text-plum hover:bg-plum/5">
                  <ImagePlus className="h-4 w-4" /> Choose another
                </label>
                <button type="button" onClick={removeReceipt} disabled={submitting} className="inline-flex items-center gap-2 rounded-lg border border-plum/20 px-3 py-2 text-xs font-bold text-plum hover:bg-plum/5 disabled:opacity-50">
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label htmlFor="payment-receipt" className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-plum/25 bg-white px-4 py-6 text-center transition hover:border-plum/50 hover:bg-oatmeal">
            <ImagePlus className="h-7 w-7 text-plum" />
            <span className="mt-2 text-sm font-bold text-ink">Choose receipt screenshot</span>
            <span className="mt-1 text-xs text-ink/65">PNG, JPEG, or WebP · up to 4 MB</span>
          </label>
        )}
      </div>
      {message && (
        <div role={success ? "status" : "alert"} className={`mt-6 flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${success ? "bg-plum/10 text-plum" : "border border-gold/50 bg-oatmeal text-ink"}`}>
          {success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          {message}
        </div>
      )}
      <button disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-plum px-5 py-3.5 font-bold text-white transition hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum disabled:cursor-not-allowed disabled:opacity-70">
        {submitting ? <><LoaderCircle className="h-5 w-5 animate-spin" /> Registering…</> : <>Register &amp; get my pass <ArrowRight className="h-4 w-4" /></>}
      </button>
      <p className="mt-4 text-center text-xs text-ink/65">Your details are used only for event registration.</p>
    </form>
  );
}
