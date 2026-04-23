import { type FormEvent, useState } from "react";
import {
  getGetItemsQueryKey,
  useDeleteItemsId,
  useGetItems,
  usePostItems,
  usePatchItemsId,
  type Item,
} from "./api";
import { useQueryClient } from "@tanstack/react-query";

const RESOURCE_TYPES = ["Room", "Equipment", "Vehicle", "Desk", "Other"];

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
                      className="flex items-start justify-between gap-3 px-5 py-4"
                    >
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
