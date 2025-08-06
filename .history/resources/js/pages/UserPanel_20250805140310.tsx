/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const UserPanel = () => {
    const { users } = usePage().props as any;
    const { data, setData, put, processing, reset } = useForm({
        id: null,
        status: '',
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    const handleEdit = (user: any) => {
        setData({
            id: user.id,
            status: user.status,
        });
        setEditingId(user.id);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/users/${data.id}`, {
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

    return (
        <AppLayout breadcrumbs={[{ title: 'Users', href: '/users' }]}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className='relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border p-4'>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Users Management</h1>
                    </div>
                    
                    {users && users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border rounded dark:bg-gray-800">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-700">
                                        <th className="text-left px-4 py-2">#</th>
                                        <th className="text-left px-4 py-2">Name</th>
                                        <th className="text-left px-4 py-2">Email</th>
                                        <th className="text-left px-4 py-2">Category</th>
                                        <th className="text-left px-4 py-2">Subcategory</th>
                                        <th className="text-left px-4 py-2">Institute Type</th>
                                        <th className="text-left px-4 py-2">Status</th>
                                        <th className="text-left px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user: any, index: number) => (
                                        <tr key={user.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                                            <td className="px-4 py-2">{index + 1}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center">
                                                    {user.avatar && (
                                                        <img 
                                                            src={user.avatar} 
                                                            alt={`${user.first_name} ${user.last_name}`} 
                                                            className="w-8 h-8 rounded-full mr-2"
                                                        />
                                                    )}
                                                    <span>{user.first_name} {user.last_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">{user.email}</td>
                                            <td className="px-4 py-2">{user.category?.name || '-'}</td>
                                            <td className="px-4 py-2">{user.subcategory?.name || '-'}</td>
                                            <td className="px-4 py-2">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                    {user.institute_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingId === user.id ? (
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
                                                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {user.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 space-x-2">
                                                {editingId !== user.id && (
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="text-sm bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                                                    >
                                                        Edit Status
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this user?')) {
                                                            // Inertia delete request would go here
                                                            console.log(`Delete user ${user.id}`);
                                                        }
                                                    }}
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
                        <div className="text-center py-12">
                            <div className="text-gray-500 mb-4">No users found.</div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default UserPanel;