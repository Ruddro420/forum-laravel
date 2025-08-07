import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Category', href: '/category' },
];

type CategoryType = {
  id: number;
  name: string;
};

export default function Category() {
  const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
    name: '',
    id: null as number | null,
  });

  type PageProps = {
    categories: CategoryType[];
    [key: string]: unknown;
  };
  const { categories } = usePage<PageProps>().props;

  const [editing, setEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editing && data.id) {
      put(`/category/${data.id}`, {
        onSuccess: () => {
          reset();
          setEditing(false);
        },
      });
    } else {
      post('/category', {
        onSuccess: () => reset(),
      });
    }
  };

  const handleEdit = (category: CategoryType) => {
    setData({ name: category.name, id: category.id });
    setEditing(true);
    // reset();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure?')) {
      destroy(`/category/${id}`);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Category" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border p-4">
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="name" className="block font-semibold mb-1">Category Name</label>
              <input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="w-full rounded-sm border border-gray-300 p-2 dark:bg-gray-800 dark:text-white"
                required
                placeholder='Enter category name'
              />
              {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
            </div>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editing ? 'Update Category' : 'Add Category'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  reset();
                  setEditing(false);
                }}
                className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </form>

          {/* Category List */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Category List</h2>
            <table className="min-w-full bg-white border rounded dark:bg-gray-800">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="text-left px-4 py-2">#</th>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories?.length > 0 ? categories.map((cat, index) => (
                  <tr key={cat.id} className="border-t dark:border-gray-700">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{cat.name}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="text-sm bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="text-center py-4">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
