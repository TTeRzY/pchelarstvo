# -*- coding: utf-8 -*-
from pathlib import Path
content = """// components/swarm/ReportSwarmModal.tsx
\"use client\";
import { useState } from \"react\";
import Modal from \"@/components/modal/Modal\";
import { useModal } from \"@/components/modal/ModalProvider\";

const initialState = {{
  name: \"\",
  phone: \"\",
  location: \"\",
  notes: \"\",
}};

type SwarmFormState = typeof initialState;
const UPDATE_EVENT = \"swarm:updated\";

export default function ReportSwarmModal() {{
  const {{ type, close }} = useModal();
  const [form, setForm] = useState<SwarmFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (type !== \"reportSwarm\") {{
    return null;
  }}

  function update<K extends keyof SwarmFormState>(key: K, value: SwarmFormState[K]) {{
    setForm((prev) => ({{ ...prev, [key]: value }}));
  }}

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {{
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {{
      const payload = {{
        name: form.name.trim() or None,
        phone: form.phone.trim() or None,
        location: form.location.strip(),
        notes: form.notes.strip() or None,
      }}

