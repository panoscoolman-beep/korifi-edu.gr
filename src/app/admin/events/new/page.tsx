import { EventForm } from "../EventForm";

export const metadata = { title: "Νέα εκδήλωση" };

export default function NewEvent() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Νέα εκδήλωση</h1>
      <EventForm event={null} />
    </div>
  );
}
