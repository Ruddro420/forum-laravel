/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const SubCategory = () => {

    const { categories, subcategories } = usePage().props as any;

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        category_id: '',
        name: '',
        id: null,
    });

    const [editing, setEditing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing && data.id) {
            put(`/subcategory/${data.id}`, {
                onSuccess: () => {
                    reset();
                    setEditing(false);
                },
            });
        } else {
            post('/subcategory', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleEdit = (sub: any) => {
        setData({
            name: sub.name,
            category_id: sub.category_id,
            id: sub.id,
        });
        setEditing(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure?')) {
            destroy(`/subcategory/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Sub Category', href: '/subcategory' }]}>
            <Head title="Sub Category" />

            <div className="p-4 space-y-6">

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div>
                        <label className="block mb-1 font-medium">Select Category</label>
                        <select
                            value={data.category_id}
                            onChange={(e) => setData('category_id', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white"
                            required
                        >
                            <option value="">-- Select Category --</option>
                            {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Subcategory Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full border p-2 rounded dark:bg-gray-800 dark:text-white"
                            required
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        {editing ? 'Update Subcategory' : 'Add Subcategory'}
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

                {/* Subcategory List */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Subcategory List</h2>
                    <table className="min-w-full bg-white border rounded dark:bg-gray-800">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="text-left px-4 py-2">#</th>
                                <th className="text-left px-4 py-2">Category</th>
                                <th className="text-left px-4 py-2">Subcategory</th>
                                <th className="text-left px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subcategories.length > 0 ? subcategories?.map((sub: any, index: number) => (
                                <tr key={sub.id} className="border-t dark:border-gray-700">
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="px-4 py-2">{sub.category?.name}</td>
                                    <td className="px-4 py-2">{sub.name}</td>
                                    <td className="px-4 py-2 space-x-2">
                                        <button
                                            onClick={() => handleEdit(sub)}
                                            className="text-sm bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">No subcategories found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </AppLayout>
    );
};

export default SubCategory;
