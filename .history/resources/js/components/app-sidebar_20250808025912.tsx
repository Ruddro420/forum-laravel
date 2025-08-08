/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';
// Adjust the import path and casing to match your actual file structure
import ChatBox from '@/pages/ChatBox';


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Category',
        href: '/category',
        icon: LayoutGrid,
    },
    {
        title: 'Sub Category',
        href: '/subcategory',
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/users',
        icon: LayoutGrid,
    },
    {
        title: 'Posts',
        href: '/posts',
        icon: LayoutGrid,
    },
    {
        title: 'Books',
        href: '/bookShow',
        icon: LayoutGrid,
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    const { auth } = usePage().props as any; // Assuming your Inertia response includes auth.user

    // For demo, let's say you want to chat with user ID 2
    const receiverId = 1;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            {/* Add ChatBox just above the footer */}
            <div className="p-4 border-t border-sidebar-border">
                <ChatBox auth={auth} receiverId={receiverId} />
            </div>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
