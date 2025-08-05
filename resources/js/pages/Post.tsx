/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

const Post = () => {
    const { posts, categories, subCategories } = usePage().props as any;

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
        title: '',
        category_id: '',
        sub_category_id: '',
        details: '',
        tag: '',
        status: 'active',
        student_id:'admin',
        file: null,
        post_img: null,
    });

    const handleEdit = (post: any) => {
        setData({
            ...data,
            id: post.id,
            status: post.status,
        });
        setEditingId(post.id);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/posts/${data.id}`, {
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

    const handleDelete = (postId: number) => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(`/posts/${postId}`);
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        
        e.preventDefault();
        post('/posts', {
            onSuccess: () => {
                reset();
                setShowCreateForm(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Posts', href: '/posts' }]}>
            <Head title="Posts" />
            <div className="flex flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className='relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4'>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Posts Management</h1>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            {showCreateForm ? 'Cancel' : ' Add New Post'}
                        </button>
                    </div>

                    {showCreateForm && (
                        <form onSubmit={handleCreate} className="mb-6 space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded shadow">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Title"
                                    className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                                    required
                                />
                                <input
                                    type="text"
                                    value={data.tag}
                                    onChange={(e) => setData('tag', e.target.value)}
                                    placeholder="Tag"
                                    className="border p-2 rounded dark:bg-gray-700 dark:text-white"
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
                                value={data.details}
                                onChange={(e) => setData('details', e.target.value)}
                                placeholder="Details"
                                className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white"
                                rows={4}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="file"
                                    onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                    className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="file"
                                    onChange={(e) => setData('post_img', e.target.files?.[0] ?? null)}
                                    className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                {processing ? 'Saving...' : 'Create Post'}
                            </button>

                            {progress && (
                                <div className="mt-2 text-sm text-blue-600">Uploading: {progress.percentage}%</div>
                            )}
                        </form>
                    )}

                    {posts && posts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border rounded dark:bg-gray-800">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-700">
                                        <th className="text-left px-4 py-2">#</th>
                                        <th className="text-left px-4 py-2">Title</th>
                                        <th className="text-left px-4 py-2">Category</th>
                                        <th className="text-left px-4 py-2">Subcategory</th>
                                        <th className="text-left px-4 py-2">Tag</th>
                                        <th className="text-left px-4 py-2">Details</th>
                                        <th className="text-left px-4 py-2">File</th>
                                        <th className="text-left px-4 py-2">Image</th>
                                        <th className="text-left px-4 py-2">Status</th>
                                        <th className="text-left px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map((post: any, index: number) => (
                                        <tr key={post.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                                            <td className="px-4 py-2">{index + 1}</td>
                                            <td className="px-4 py-2">{post.title}</td>
                                            <td className="px-4 py-2">{post.category?.name || '-'}</td>
                                            <td className="px-4 py-2">{post.sub_category?.name || '-'}</td>
                                            <td className="px-4 py-2">{post.tag}</td>
                                            <td className="px-4 py-2 max-w-xs truncate">{post.details}</td>
                                            <td className="px-4 py-2">
                                                {post.file ? (
                                                    <a
                                                        href={`/storage/${post.file}`}
                                                        target="_blank"
                                                        className="text-blue-600 underline"
                                                    >
                                                        View
                                                    </a>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {post.post_img ? (
                                                    <img
                                                        src={`/storage/${post.post_img}`}
                                                        alt="Post"
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === post.id ? (
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
                                                        post.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        post.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {post.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 space-x-2">
                                                {editingId !== post.id && (
                                                    <button
                                                        onClick={() => handleEdit(post)}
                                                        className="text-sm bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                                                    >
                                                        Edit Status
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(post.id)}
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
                            No posts found.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Post;
