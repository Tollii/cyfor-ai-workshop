import { type FormEvent, useState } from "react";
import {
  getGetItemsQueryKey,
  useDeleteItemsId,
  useGetItems,
  usePostItems,
} from "./api";
import { useQueryClient } from "@tanstack/react-query";

export default function App() {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();
  const refreshItems = () =>
    queryClient.invalidateQueries({ queryKey: getGetItemsQueryKey() });
  const itemsQuery = useGetItems();
  const createItemMutation = usePostItems({
    mutation: {
      onSuccess: async () => {
        setTitle("");
        await refreshItems();
      },
    },
  });
  const deleteItemMutation = useDeleteItemsId({
    mutation: {
      onSuccess: refreshItems,
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
        },
      });
  };

  const handleRemove = (id: number) => {
    if (deleteItemMutation.isPending) {
      return;
    }

    deleteItemMutation.mutate({ id });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Workshop items</h1>
          <p className="text-sm text-slate-600">
            A simple add and remove list powered by the generated API hooks.
          </p>
        </header>

        <form
          className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
          onSubmit={handleSubmit}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add an item"
            maxLength={120}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            disabled={!trimmedTitle || createItemMutation.isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {createItemMutation.isPending ? "Adding..." : "Add item"}
          </button>
        </form>

        {createItemMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not add the item: {createItemMutation.error.message}
          </p>
        ) : null}

        {deleteItemMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not remove the item: {deleteItemMutation.error.message}
          </p>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-700">Items</h2>

          {itemsQuery.isPending ? <p className="mt-3 text-sm text-slate-600">Loading items...</p> : null}

          {itemsQuery.isError ? (
            <p className="mt-3 text-sm text-rose-600">Could not load items: {itemsQuery.error.message}</p>
          ) : null}

          {!itemsQuery.isPending && !itemsQuery.isError ? (
            items.length > 0 ? (
              <ul className="mt-3 divide-y divide-slate-200">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                    <span>{item.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      disabled={deleteItemMutation.isPending}
                      className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    >
                      {deleteItemMutation.isPending && deletingItemId === item.id
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">No items yet.</p>
            )
          ) : null}
        </section>
      </div>
    </main>
  );
}
