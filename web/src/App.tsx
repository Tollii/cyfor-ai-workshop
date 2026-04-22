import { type FormEvent, useState } from "react";
import {
  Category,
  getGetResourcesQueryKey,
  useDeleteResourcesId,
  useGetResources,
  usePostResources,
  usePutResourcesId,
} from "./api";
import type { Resource } from "./api/generated/hooks";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = Object.values(Category);

const categoryLabel = (cat: string) =>
  cat.charAt(0).toUpperCase() + cat.slice(1);

export default function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("general");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<string>("general");
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  const queryClient = useQueryClient();

  const filterParams = {
    ...(searchText.trim() ? { search: searchText.trim() } : {}),
    ...(filterCategory
      ? { category: filterCategory as typeof Category[keyof typeof Category] }
      : {}),
  };

  const refreshResources = () =>
    queryClient.invalidateQueries({
      queryKey: getGetResourcesQueryKey(filterParams),
    });

  const resourcesQuery = useGetResources(filterParams);
  const createMutation = usePostResources({
    mutation: {
      onSuccess: async () => {
        setTitle("");
        setDescription("");
        setCategory("general");
        await refreshResources();
      },
    },
  });
  const updateMutation = usePutResourcesId({
    mutation: {
      onSuccess: async () => {
        setEditingId(null);
        await refreshResources();
      },
    },
  });
  const deleteMutation = useDeleteResourcesId({
    mutation: {
      onSuccess: refreshResources,
    },
  });

  const trimmedTitle = title.trim();
  const resources = resourcesQuery.data?.resources ?? [];
  const deletingId = deleteMutation.variables?.id;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedTitle || createMutation.isPending) return;

    createMutation.mutate({
      data: {
        title: trimmedTitle,
        description: description.trim() || undefined,
        category:
          (category as typeof Category[keyof typeof Category]) || undefined,
      },
    });
  };

  const startEdit = (resource: Resource) => {
    setEditingId(resource.id);
    setEditTitle(resource.title);
    setEditDescription(resource.description);
    setEditCategory(resource.category);
  };

  const cancelEdit = () => setEditingId(null);

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTitle.trim() || updateMutation.isPending || editingId === null)
      return;

    updateMutation.mutate({
      id: editingId,
      data: {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory as typeof Category[keyof typeof Category],
      },
    });
  };

  const handleRemove = (id: number) => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate({ id });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Resource Manager</h1>
          <p className="text-sm text-slate-600">
            Create, edit, and manage bookable resources.
          </p>
        </header>

        <form
          className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          onSubmit={handleSubmit}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resource title"
            maxLength={120}
            className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            maxLength={500}
            className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
          />
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabel(cat)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!trimmedTitle || createMutation.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {createMutation.isPending ? "Adding..." : "Add resource"}
            </button>
          </div>
        </form>

        {createMutation.isError && (
          <p className="text-sm text-rose-600">
            Could not add the resource: {createMutation.error.message}
          </p>
        )}

        {updateMutation.isError && (
          <p className="text-sm text-rose-600">
            Could not update the resource: {updateMutation.error.message}
          </p>
        )}

        {deleteMutation.isError && (
          <p className="text-sm text-rose-600">
            Could not remove the resource: {deleteMutation.error.message}
          </p>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-700">Resources</h2>

          <div className="mt-3 flex gap-3">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search resources..."
              className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          {resourcesQuery.isPending && (
            <p className="mt-3 text-sm text-slate-600">Loading resources...</p>
          )}

          {resourcesQuery.isError && (
            <p className="mt-3 text-sm text-rose-600">
              Could not load resources: {resourcesQuery.error.message}
            </p>
          )}

          {!resourcesQuery.isPending && !resourcesQuery.isError ? (
            resources.length > 0 ? (
              <ul className="mt-3 divide-y divide-slate-200">
                {resources.map((resource) =>
                  editingId === resource.id ? (
                    <li key={resource.id} className="py-3">
                      <form
                        className="flex flex-col gap-2"
                        onSubmit={handleUpdate}
                      >
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={120}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
                        />
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          maxLength={500}
                          placeholder="Description"
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
                        />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {categoryLabel(cat)}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={
                              !editTitle.trim() || updateMutation.isPending
                            }
                            className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {updateMutation.isPending ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </li>
                  ) : (
                    <li
                      key={resource.id}
                      className="flex items-start justify-between gap-3 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{resource.title}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {categoryLabel(resource.category)}
                          </span>
                        </div>
                        {resource.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {resource.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(resource)}
                          className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(resource.id)}
                          disabled={deleteMutation.isPending}
                          className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                        >
                          {deleteMutation.isPending &&
                          deletingId === resource.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                {searchText.trim() || filterCategory
                  ? "No resources match your filters."
                  : "No resources yet."}
              </p>
            )
          ) : null}
        </section>
      </div>
    </main>
  );
}
