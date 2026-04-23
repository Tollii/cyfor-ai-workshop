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

  const queryClient = useQueryClient();
  const refreshItems = () =>
    queryClient.invalidateQueries({ queryKey: getGetItemsQueryKey() });

  const itemsQuery = useGetItems();
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
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Resources</h1>
          <p className="text-sm text-slate-600">
            Manage bookable resources powered by the generated API hooks.
          </p>
        </header>

        <form
          className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          onSubmit={handleSubmit}
        >
          <h2 className="text-sm font-medium text-slate-700">Add resource</h2>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Resource name"
            maxLength={120}
            className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500 text-slate-700"
          >
            <option value="">Type (optional)</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description (optional)"
            maxLength={500}
            rows={2}
            className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500 resize-none"
          />
          <button
            type="submit"
            disabled={!trimmedTitle || createItemMutation.isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {createItemMutation.isPending ? "Adding..." : "Add resource"}
          </button>
        </form>

        {createItemMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not add the resource: {createItemMutation.error.message}
          </p>
        ) : null}

        {deleteItemMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not remove the resource: {deleteItemMutation.error.message}
          </p>
        ) : null}

        {updateItemMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not update the resource: {updateItemMutation.error.message}
          </p>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-700">Resources</h2>

          {itemsQuery.isPending ? (
            <p className="mt-3 text-sm text-slate-600">Loading resources...</p>
          ) : null}

          {itemsQuery.isError ? (
            <p className="mt-3 text-sm text-rose-600">
              Could not load resources: {itemsQuery.error.message}
            </p>
          ) : null}

          {!itemsQuery.isPending && !itemsQuery.isError ? (
            items.length > 0 ? (
              <ul className="mt-3 divide-y divide-slate-200">
                {items.map((item) =>
                  editing?.id === item.id ? (
                    <li key={item.id} className="py-3">
                      <form
                        className="flex flex-col gap-2"
                        onSubmit={handleSaveEdit}
                      >
                        <input
                          value={editing.title}
                          onChange={(e) =>
                            setEditing({ ...editing, title: e.target.value })
                          }
                          maxLength={120}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
                        />
                        <select
                          value={editing.type}
                          onChange={(e) =>
                            setEditing({ ...editing, type: e.target.value })
                          }
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500 text-slate-700"
                        >
                          <option value="">Type (optional)</option>
                          {!RESOURCE_TYPES.includes(editing.type) && editing.type ? (
                            <option value={editing.type}>{editing.type} (current)</option>
                          ) : null}
                          {RESOURCE_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={editing.description}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              description: e.target.value,
                            })
                          }
                          maxLength={500}
                          rows={2}
                          placeholder="Description (optional)"
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={
                              !editing.title.trim() ||
                              updateItemMutation.isPending
                            }
                            className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {updateItemMutation.isPending ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </li>
                  ) : (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          {item.type ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {item.type}
                            </span>
                          ) : null}
                        </div>
                        {item.description ? (
                          <p className="mt-0.5 text-sm text-slate-500">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          disabled={deleteItemMutation.isPending}
                          className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                        >
                          {deleteItemMutation.isPending &&
                          deletingItemId === item.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">No resources yet.</p>
            )
          ) : null}
        </section>
      </div>
    </main>
  );
}
