'use client';

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';

interface Stats {
  totalArtworks: number;
  totalCollections: number;
  totalOrders: number;
  totalUsers: number;
  pendingMessages: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalArtworks: 0,
    totalCollections: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingMessages: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In a real app, you'd fetch this from an API endpoint
      // For now, we'll use placeholder data
      setStats({
        totalArtworks: 24,
        totalCollections: 6,
        totalOrders: 12,
        totalUsers: 48,
        pendingMessages: 5,
        totalRevenue: 15420,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Artworks',
      value: stats.totalArtworks,
      icon: '🎨',
      href: '/admin/artworks',
      color: 'bg-blue-500',
    },
    {
      name: 'Collections',
      value: stats.totalCollections,
      icon: '📚',
      href: '/admin/collections',
      color: 'bg-purple-500',
    },
    {
      name: 'Orders',
      value: stats.totalOrders,
      icon: '🛒',
      href: '/admin/orders',
      color: 'bg-green-500',
    },
    {
      name: 'Users',
      value: stats.totalUsers,
      icon: '👥',
      href: '/admin/users',
      color: 'bg-yellow-500',
    },
    {
      name: 'Pending Messages',
      value: stats.pendingMessages,
      icon: '✉️',
      href: '/admin/messages',
      color: 'bg-red-500',
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: '💰',
      href: '/admin/orders',
      color: 'bg-indigo-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your admin dashboard. Here's what's happening with your gallery.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${stat.color} text-white text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/artworks/new"
              className="block px-4 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors text-center"
            >
              + Add New Artwork
            </Link>
            <Link
              href="/admin/collections/new"
              className="block px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              + Create Collection
            </Link>
            <Link
              href="/admin/messages"
              className="block px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              View Messages ({stats.pendingMessages} pending)
            </Link>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                ✓
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">New order received</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                ✉
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">New contact message</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                ⭐
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">New review posted</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
