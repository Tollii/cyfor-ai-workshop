import { type FormEvent, useState } from "react";
import {
  getGetItemsQueryKey,
  useDeleteItemsId,
  useGetItems,
  usePostItems,
  usePatchItemsId,
  useGetItemsIdReservations,
  usePostItemsIdReservations,
  usePatchReservationsId,
  getGetItemsIdReservationsQueryKey,
  type Item,
  type Reservation,
  UpdateReservationStatus,
} from "./api";
import { useQueryClient } from "@tanstack/react-query";

const RESOURCE_TYPES = ["Room", "Equipment", "Vehicle", "Desk", "Other"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Venter",
  confirmed: "Bekreftet",
  cancelled: "Kansellert",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fff7ed", text: "#92400e" },
  confirmed: { bg: "#f0fdf4", text: "#166534" },
  cancelled: { bg: "#f9fafb", text: "#6b7280" },
};

type StatusFilter = "all" | "pending" | "confirmed" | "cancelled";
const STATUS_FILTER_KEYS: StatusFilter[] = ["all", "pending", "confirmed", "cancelled"];

function ItemReservations({ item }: { item: Item }) {
  const queryClient = useQueryClient();
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const refreshReservations = () =>
    queryClient.invalidateQueries({ queryKey: getGetItemsIdReservationsQueryKey(item.id) });

  const reservationsQuery = useGetItemsIdReservations(item.id);

  const createMutation = usePostItemsIdReservations({
    mutation: {
      onSuccess: async () => {
        setStartAt("");
        setEndAt("");
        setPurpose("");
        setNotes("");
        await refreshReservations();
      },
    },
  });

  const updateMutation = usePatchReservationsId({
    mutation: { onSuccess: refreshReservations },
  });

  const handleCreateReservation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startAt || !endAt || !purpose.trim() || createMutation.isPending) return;
    createMutation.mutate({
      id: item.id,
      data: {
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        purpose: purpose.trim(),
        notes: notes.trim() || undefined,
      },
    });
  };

  const handleUpdateStatus = (reservation: Reservation, status: "confirmed" | "cancelled") => {
    if (updateMutation.isPending) return;
    updateMutation.mutate({ id: reservation.id, data: { status: status as typeof UpdateReservationStatus[keyof typeof UpdateReservationStatus] } });
  };

  const reservations = reservationsQuery.data?.reservations ?? [];
  const filteredReservations =
    statusFilter === "all"
      ? reservations
      : reservations.filter((r) => r.status === statusFilter);

  return (
    <div className="mt-2 border-t pt-3 space-y-3" style={{ borderColor: "#f5f2ed" }}>
      {/* Create reservation form */}
      <form onSubmit={handleCreateReservation} className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4a5c38" }}>
          Ny reservasjon
        </p>
        <div className="flex gap-2 flex-wrap">
          <div className="flex flex-col gap-0.5 flex-1 min-w-32">
            <label className="text-xs" style={{ color: "#4a5c38" }}>Start</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              className="rounded-none border-b bg-transparent px-0 py-1 text-sm outline-none"
              style={{ borderColor: "#c8b99a" }}
            />
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-32">
            <label className="text-xs" style={{ color: "#4a5c38" }}>Slutt</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              required
              className="rounded-none border-b bg-transparent px-0 py-1 text-sm outline-none"
              style={{ borderColor: "#c8b99a" }}
            />
          </div>
        </div>
        <input
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Formål *"
          maxLength={255}
          required
          className="w-full rounded-none border-b bg-transparent px-0 py-1 text-sm outline-none"
          style={{ borderColor: "#c8b99a" }}
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notater (valgfri)"
          maxLength={500}
          className="w-full rounded-none border-b bg-transparent px-0 py-1 text-sm outline-none"
          style={{ borderColor: "#c8b99a" }}
        />
        {createMutation.isError ? (
          <p className="text-xs" style={{ color: "#b91c1c" }}>
            Feil: {createMutation.error.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={!startAt || !endAt || !purpose.trim() || createMutation.isPending}
          className="rounded-none px-4 py-1 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "#4a5c38", color: "#f5f2ed" }}
        >
          {createMutation.isPending ? "Oppretter..." : "Opprett"}
        </button>
      </form>

      {/* Status filter */}
      {!reservationsQuery.isPending && reservations.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTER_KEYS.map((key) => {
            const label = key === "all" ? "Alle" : (STATUS_LABELS[key] ?? key);
            const isActive = statusFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                aria-pressed={isActive}
                className="rounded-none border px-2 py-0.5 text-xs font-medium uppercase tracking-wider"
                style={
                  isActive
                    ? { backgroundColor: "#4a5c38", color: "#f5f2ed", borderColor: "#4a5c38" }
                    : { backgroundColor: "transparent", color: "#4a5c38", borderColor: "#c8b99a" }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Existing reservations */}
      {reservationsQuery.isPending ? (
        <p className="text-xs" style={{ color: "#4a5c38" }}>Laster reservasjoner...</p>
      ) : reservations.length === 0 ? (
        <p className="text-xs font-light" style={{ color: "#4a5c38" }}>Ingen reservasjoner ennå.</p>
      ) : filteredReservations.length === 0 ? (
        <p className="text-xs font-light" style={{ color: "#4a5c38" }}>Ingen reservasjoner matcher filteret.</p>
      ) : (
        <ul className="space-y-2">
          {filteredReservations.map((r) => {
            const colors = STATUS_COLORS[r.status] ?? STATUS_COLORS.pending;
            return (
              <li key={r.id} className="flex items-start justify-between gap-2 rounded-none p-2" style={{ backgroundColor: "#f5f2ed" }}>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-medium">{r.purpose}</p>
                  <p className="text-xs font-light" style={{ color: "#4a5c38" }}>
                    {new Date(r.startAt).toLocaleString("nb-NO")} – {new Date(r.endAt).toLocaleString("nb-NO")}
                  </p>
                  {r.notes ? <p className="text-xs font-light" style={{ color: "#4a5c38" }}>{r.notes}</p> : null}
                  <span
                    className="inline-block rounded-none px-2 py-0.5 text-xs font-medium uppercase tracking-wider"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </div>
                {r.status !== "cancelled" ? (
                  <div className="flex shrink-0 flex-col gap-1">
                    {r.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(r, "confirmed")}
                        disabled={updateMutation.isPending}
                        className="rounded-none border px-2 py-0.5 text-xs font-medium disabled:opacity-40"
                        style={{ borderColor: "#4a5c38", color: "#4a5c38" }}
                      >
                        Bekreft
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(r, "cancelled")}
                      disabled={updateMutation.isPending}
                      className="rounded-none border px-2 py-0.5 text-xs font-medium disabled:opacity-40"
                      style={{ borderColor: "#c8b99a", color: "#1c2212" }}
                    >
                      Kanseller
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

type EditingState = {
  id: number;
  title: string;
  description: string;
  type: string;
};

export default function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [search, setSearch] = useState("");
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const refreshItems = () =>
    queryClient.invalidateQueries({ queryKey: getGetItemsQueryKey() });

  const searchParam = search.trim() || undefined;
  const itemsQuery = useGetItems(searchParam ? { search: searchParam } : undefined);
  const createItemMutation = usePostItems({
    mutation: {
      onSuccess: async () => {
        setTitle("");
        setDescription("");
        setType("");
        await refreshItems();
      },
    },
  });
  const deleteItemMutation = useDeleteItemsId({
    mutation: {
      onSuccess: refreshItems,
    },
  });
  const updateItemMutation = usePatchItemsId({
    mutation: {
      onSuccess: async () => {
        setEditing(null);
        await refreshItems();
      },
    },
  });

  const trimmedTitle = title.trim();
  const items = itemsQuery.data?.items ?? [];
  const deletingItemId = deleteItemMutation.variables?.id;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedTitle || createItemMutation.isPending) {
      return;
    }

    createItemMutation.mutate({
      data: {
        title: trimmedTitle,
        description: description.trim() || undefined,
        type: type.trim() || undefined,
      },
    });
  };

  const handleRemove = (id: number) => {
    if (deleteItemMutation.isPending) {
      return;
    }

    deleteItemMutation.mutate({ id });
  };

  const handleStartEdit = (item: Item) => {
    setEditing({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      type: item.type ?? "",
    });
  };

  const handleSaveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editing || updateItemMutation.isPending) {
      return;
    }

    const trimmedEditTitle = editing.title.trim();
    if (!trimmedEditTitle) return;

    updateItemMutation.mutate({
      id: editing.id,
      data: {
        title: trimmedEditTitle,
        description: editing.description.trim() || null,
        type: editing.type.trim() || null,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f2ed", color: "#1c2212" }}>
      {/* ── Top navigation bar ─────────────────────────────── */}
      <header style={{ backgroundColor: "#1c2212" }}>
        <div className="mx-auto max-w-4xl flex items-center gap-4 px-6 py-4">
          <img
            src="/forsvaret-logo-hvit.png"
            alt="Forsvaret"
            className="h-10 w-auto"
          />
        </div>
      </header>

      {/* ── Hero banner ────────────────────────────────────── */}
      <div style={{ backgroundColor: "#4a5c38" }} className="px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <h1
            className="text-3xl font-bold tracking-wide"
            style={{ color: "#f5f2ed" }}
          >
            Ressursadministrasjon
          </h1>
          <p className="mt-1 text-sm font-light" style={{ color: "#c8b99a" }}>
            Administrer bookbare ressurser via det genererte API-et.
          </p>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 space-y-6">

        {/* Add resource form */}
        <form
          className="flex flex-col gap-3 rounded-none border-l-4 p-5 shadow-sm"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#4a5c38",
          }}
          onSubmit={handleSubmit}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4a5c38" }}>
            Legg til ressurs
          </h2>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ressursnavn"
            maxLength={120}
            className="rounded-none border-b-2 border-t-0 border-l-0 border-r-0 bg-transparent px-0 py-2 text-base outline-none"
            style={{ borderColor: "#c8b99a", color: "#1c2212" }}
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-none border-b-2 border-t-0 border-l-0 border-r-0 bg-transparent px-0 py-2 text-base outline-none"
            style={{ borderColor: "#c8b99a", color: "#1c2212" }}
          >
            <option value="">Type (valgfri)</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Beskrivelse (valgfri)"
            maxLength={500}
            rows={2}
            className="rounded-none border-b-2 border-t-0 border-l-0 border-r-0 bg-transparent px-0 py-2 text-base outline-none resize-none"
            style={{ borderColor: "#c8b99a", color: "#1c2212" }}
          />
          <button
            type="submit"
            disabled={!trimmedTitle || createItemMutation.isPending}
            className="self-start rounded-none px-6 py-2 text-sm font-bold uppercase tracking-wider transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: "#4a5c38", color: "#f5f2ed" }}
          >
            {createItemMutation.isPending ? "Legger til..." : "Legg til"}
          </button>
        </form>

        {/* Error messages */}
        {createItemMutation.isError ? (
          <p className="text-sm" style={{ color: "#b91c1c" }}>
            Kunne ikke legge til ressurs: {createItemMutation.error.message}
          </p>
        ) : null}

        {deleteItemMutation.isError ? (
          <p className="text-sm" style={{ color: "#b91c1c" }}>
            Kunne ikke fjerne ressurs: {deleteItemMutation.error.message}
          </p>
        ) : null}

        {updateItemMutation.isError ? (
          <p className="text-sm" style={{ color: "#b91c1c" }}>
            Kunne ikke oppdatere ressurs: {updateItemMutation.error.message}
          </p>
        ) : null}

        {/* Resources list */}
        <section
          className="rounded-none shadow-sm"
          style={{ backgroundColor: "#ffffff" }}
        >
          <div
            className="flex items-center justify-between gap-3 px-5 py-3 border-b"
            style={{ borderColor: "#c8b99a" }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#4a5c38" }}>
              Ressurser
            </h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søk etter navn..."
              className="rounded-none border-b bg-transparent px-0 py-1 text-sm outline-none w-44"
              style={{ borderColor: "#c8b99a", color: "#1c2212" }}
            />
          </div>

          {itemsQuery.isPending ? (
            <p className="px-5 py-4 text-sm" style={{ color: "#4a5c38" }}>
              Laster ressurser...
            </p>
          ) : null}

          {itemsQuery.isError ? (
            <p className="px-5 py-4 text-sm" style={{ color: "#b91c1c" }}>
              Kunne ikke laste ressurser: {itemsQuery.error.message}
            </p>
          ) : null}

          {!itemsQuery.isPending && !itemsQuery.isError ? (
            items.length > 0 ? (
              <ul className="divide-y" style={{ borderColor: "#f5f2ed" }}>
                {items.map((item) =>
                  editing?.id === item.id ? (
                    <li key={item.id} className="px-5 py-4">
                      <form className="flex flex-col gap-2" onSubmit={handleSaveEdit}>
                        <input
                          value={editing.title}
                          onChange={(e) =>
                            setEditing({ ...editing, title: e.target.value })
                          }
                          maxLength={120}
                          className="rounded-none border-b bg-transparent px-0 py-1.5 text-sm outline-none"
                          style={{ borderColor: "#c8b99a" }}
                        />
                        <select
                          value={editing.type}
                          onChange={(e) =>
                            setEditing({ ...editing, type: e.target.value })
                          }
                          className="rounded-none border-b bg-transparent px-0 py-1.5 text-sm outline-none"
                          style={{ borderColor: "#c8b99a", color: "#1c2212" }}
                        >
                          <option value="">Type (valgfri)</option>
                          {!RESOURCE_TYPES.includes(editing.type) && editing.type ? (
                            <option value={editing.type}>{editing.type} (nåværende)</option>
                          ) : null}
                          {RESOURCE_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <textarea
                          value={editing.description}
                          onChange={(e) =>
                            setEditing({ ...editing, description: e.target.value })
                          }
                          maxLength={500}
                          rows={2}
                          placeholder="Beskrivelse (valgfri)"
                          className="rounded-none border-b bg-transparent px-0 py-1.5 text-sm outline-none resize-none"
                          style={{ borderColor: "#c8b99a" }}
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={!editing.title.trim() || updateItemMutation.isPending}
                            className="rounded-none px-4 py-1 text-sm font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ backgroundColor: "#4a5c38", color: "#f5f2ed" }}
                          >
                            {updateItemMutation.isPending ? "Lagrer..." : "Lagre"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="rounded-none border px-4 py-1 text-sm font-medium"
                            style={{ borderColor: "#c8b99a", color: "#1c2212" }}
                          >
                            Avbryt
                          </button>
                        </div>
                      </form>
                    </li>
                  ) : (
                    <li
                      key={item.id}
                      className="px-5 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.title}</span>
                            {item.type ? (
                              <span
                                className="rounded-none px-2 py-0.5 text-xs font-medium uppercase tracking-wider"
                                style={{ backgroundColor: "#f5f2ed", color: "#4a5c38" }}
                              >
                                {item.type}
                              </span>
                            ) : null}
                          </div>
                          {item.description ? (
                            <p className="mt-0.5 text-sm font-light" style={{ color: "#4a5c38" }}>
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                            className="rounded-none border px-3 py-1 text-sm font-medium"
                            style={{ borderColor: "#4a5c38", color: "#4a5c38" }}
                          >
                            {expandedItemId === item.id ? "Skjul" : "Reserver"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="rounded-none border px-3 py-1 text-sm font-medium"
                            style={{ borderColor: "#c8b99a", color: "#1c2212" }}
                          >
                            Rediger
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            disabled={deleteItemMutation.isPending}
                            className="rounded-none border px-3 py-1 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ borderColor: "#c8b99a", color: "#1c2212" }}
                          >
                            {deleteItemMutation.isPending && deletingItemId === item.id
                              ? "Fjerner..."
                              : "Fjern"}
                          </button>
                        </div>
                      </div>
                      {expandedItemId === item.id ? <ItemReservations item={item} /> : null}
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm font-light" style={{ color: "#4a5c38" }}>
                Ingen ressurser ennå.
              </p>
            )
          ) : null}
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        className="px-6 py-4 text-xs font-light text-center"
        style={{ backgroundColor: "#1c2212", color: "#c8b99a" }}
      >
        Forsvaret – Ressursadministrasjon
      </footer>
    </div>
  );
}
