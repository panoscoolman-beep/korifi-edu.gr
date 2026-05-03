import { PartnerForm } from "../PartnerForm";

export const metadata = { title: "Νέος συνεργάτης" };

export default function NewPartner() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Νέος συνεργάτης</h1>
      <PartnerForm item={null} />
    </div>
  );
}
