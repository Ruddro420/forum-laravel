/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

const Books = () => {
  const { books, categories, subCategories } = usePage().props as any;

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    data,
    setData,
    post,
    put,
    reset,
    processing,
    progress
  } = useForm({
    id: null,
    name: '',
    category_id: '',
    sub_category_id: '',
    description: '',
    price: '',
    status: 'active',
    book_file: null,
    cover_image: null,
  });

  const handleEdit = (book: any) => {
    setData({
      id: book.id,
      status: book.status,
    });
    setEditingId(book.id);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/books/${data.id}`, {
      onSuccess: () => {
        reset();
        setEditingId(null);
      },
    });
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
  };

  const handleDelete = (bookId: number) => {
    if (confirm('Are you sure you want to delete this book?')) {
      router.delete(`/books/${bookId}`);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    post('/books', {
      onSuccess: () => {
        reset();
        setShowCreateForm(false);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Books', href: '/books' }]}>
      <Head title="Books" />
      <div className="flex flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className='relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4'>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Books Management</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showCreateForm ? 'Cancel' : 'Add New Book'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreate} className="mb-6 space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Book Name"
                  className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                  required
                />
                <input
                  type="number"
                  value={data.price}
                  onChange={(e) => setData('price', e.target.value)}
                  placeholder="Price"
                  className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                  required
                />
                <select
                  value={data.category_id}
                  onChange={(e) => setData('category_id', e.target.value)}
                  className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={data.sub_category_id}
                  onChange={(e) => setData('sub_category_id', e.target.value)}
                  className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Subcategory</option>
                  {subCategories.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <textarea
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Description"
                className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white"
                rows={4}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="file"
                  onChange={(e) => setData('book_file', e.target.files?.[0] ?? null)}
                  className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
                  accept=".pdf,.epub"
                />
                <input
                  type="file"
                  onChange={(e) => setData('cover_image', e.target.files?.[0] ?? null)}
                  className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
                  accept="image/*"
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {processing ? 'Saving...' : 'Create Book'}
              </button>

              {progress && (
                <div className="mt-2 text-sm text-blue-600">Uploading: {progress.percentage}%</div>
              )}
            </form>
          )}

          {books && books.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded dark:bg-gray-800">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="text-left px-4 py-2">#</th>
                    <th className="text-left px-4 py-2">Book Name</th>
                    <th className="text-left px-4 py-2">Category</th>
                    <th className="text-left px-4 py-2">Subcategory</th>
                    <th className="text-left px-4 py-2">Price</th>
                    <th className="text-left px-4 py-2">Description</th>
                    <th className="text-left px-4 py-2">Book File</th>
                    <th className="text-left px-4 py-2">Cover Image</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book: any, index: number) => (
                    <tr key={book.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{book.name}</td>
                      <td className="px-4 py-2">{book.category?.name || '-'}</td>
                      <td className="px-4 py-2">{book.sub_category?.name || '-'}</td>
                      <td className="px-4 py-2">${book.price}</td>
                      <td className="px-4 py-2 max-w-xs truncate">{book.description}</td>
                      <td className="px-4 py-2">
                        {book.book_file ? (
                          <a href={`/storage/${book.book_file}`} target="_blank" className="text-blue-600 underline" rel="noreferrer">
                            View
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-2">
                        {book.cover_image ? (
                          <img
                            src={`/storage/${book.cover_image}`}
                            alt="Cover"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : '-'}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === book.id ? (
                          <form onSubmit={handleSave} className="flex items-center space-x-2">
                            <select
                              value={data.status}
                              onChange={(e) => setData('status', e.target.value)}
                              className="border p-1 rounded dark:bg-gray-800 dark:text-white"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="pending">Pending</option>
                            </select>
                            <button
                              type="submit"
                              disabled={processing}
                              className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancel}
                              className="text-sm bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            book.status === 'active' ? 'bg-green-100 text-green-800' :
                              book.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                          }`}>
                            {book.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        {editingId !== book.id && (
                          <button
                            onClick={() => handleEdit(book)}
                            className="text-sm bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                          >
                            Edit Status
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No books found.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Books;
