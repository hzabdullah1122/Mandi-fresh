"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function MessagesAdmin({ token }) {
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api("/admin/messages", { token })
      .then(setMessages)
      .catch((e) => setError(e.message));
  }, [token]);
  useEffect(load, [load]);

  const toggleRead = async (m) => {
    try {
      await api(`/admin/messages/${m.id}`, { method: "PATCH", token, body: { read: !m.read } });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    try {
      await api(`/admin/messages/${m.id}`, { method: "DELETE", token });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const unread = (messages || []).filter((m) => !m.read).length;

  return (
    <div>
      <p className="text-sm text-ink/60">{messages ? `${messages.length} message(s), ${unread} unread` : ""}</p>
      {error && <p className="mt-4 text-sm text-clay">{error}</p>}
      {!messages && !error && <p className="mt-6 text-ink/60">Loading…</p>}
      {messages?.length === 0 && <p className="mt-6 text-ink/60">No messages yet.</p>}

      <ul className="mt-5 space-y-4">
        {messages?.map((m) => (
          <li
            key={m.id}
            className={`rounded-md border p-5 ${m.read ? "border-ink/10 bg-white" : "border-leaf/40 bg-[#f1f7f2]"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {m.name} {!m.read && <span className="ml-2 rounded-full bg-leaf px-2 py-0.5 text-xs text-white">New</span>}
                </p>
                <p className="text-sm text-ink/60">
                  {m.email}
                  {m.phone && ` · ${m.phone}`}
                </p>
              </div>
              <div className="text-right text-sm text-ink/60">
                <p>{m.topic}</p>
                <p>{formatDate(m.createdAt)}</p>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
            <div className="mt-4 flex flex-wrap gap-5 text-sm font-medium">
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.topic)}`}
                className="text-leaf underline underline-offset-4"
              >
                Reply by email
              </a>
              <button onClick={() => toggleRead(m)} className="text-ink/70 underline underline-offset-4">
                Mark as {m.read ? "unread" : "read"}
              </button>
              <button onClick={() => remove(m)} className="text-clay underline underline-offset-4">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
