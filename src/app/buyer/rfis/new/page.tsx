import { CreateRfiForm } from "@/components/rfx/forms/create-rfi-form";

export default function CreateRfiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create RFI</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Build a questionnaire to gather information from suppliers
        </p>
      </div>
      <CreateRfiForm />
    </div>
  );
}
