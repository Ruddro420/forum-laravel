import { Breadcrumbs } from '@/components/breadcrumbs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React from 'react';

const SubCategory = () => {
    return (
        <div>
            <AppLayout breadcrumbs={[{ title: 'Sub Category', href: '/subcategory' }]}>
                <Head title="Sub Category" />

            </AppLayout>
        </div>
    );
};

export default SubCategory;