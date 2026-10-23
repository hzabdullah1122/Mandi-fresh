"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/Toast";

export default function MessagesAdmin({ token }) {
  const toast = useToast();
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState("");
  const [replying, setReplying] = useState(null); // id of the message being answered
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

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
      toast.error(e.message);
    }
  };

  const remove = async (m) => {
    const ok = await toast.confirm({
      title: "Delete this message?",
      message: `The message from ${m.name} will be removed for good.`,
      confirmText: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/admin/messages/${m.id}`, { method: "DELETE", token });
      toast.success("Message deleted");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const startReply = (m) => {
    setReplying(m.id);
    setDraft(`Hi ${m.name.split(" ")[0]},\n\n\n\nRegards,\nMandi Fresh`);
  };

  const sendReply = async (m) => {
    setSending(true);
    try {
      await api(`/admin/messages/${m.id}/reply`, { method: "POST", token, body: { text: draft } });
      toast.success(`Reply sent to ${m.email}`);
      setReplying(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
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
                  {m.name}{" "}
                  {!m.read && <span className="ml-2 rounded-full bg-leaf px-2 py-0.5 text-xs text-white">New</span>}
                  {m.reply && (
                    <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-xs text-ink/70">Replied</span>
                  )}
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

            {m.reply && (
              <div className="mt-4 rounded-md bg-sand p-4 text-sm">
                <p className="text-xs text-ink/50">You replied on {formatDate(m.reply.sentAt)}</p>
                <p className="mt-1 whitespace-pre-wrap">{m.reply.text}</p>
              </div>
            )}

            {replying === m.id && (
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium">Your reply to {m.email}</label>
                <textarea
                  className="input"
                  rows={7}
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => sendReply(m)} disabled={sending || !draft.trim()} className="btn">
                    {sending ? "Sending…" : "Send reply"}
                  </button>
                  <button onClick={() => setReplying(null)} disabled={sending} className="btn-outline">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-5 text-sm font-medium">
              {replying !== m.id && (
                <button onClick={() => startReply(m)} className="text-leaf underline underline-offset-4">
                  {m.reply ? "Reply again" : "Reply"}
                </button>
              )}
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
