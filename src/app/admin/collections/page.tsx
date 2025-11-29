'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  artworkCount: number;
  createdAt: string;
}

export default function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      const data = await response.json();
      setCollections(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const response = await fetch(`/api/collections/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCollections(collections.filter((c) => c.slug !== slug));
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const toggleFeatured = async (slug: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/collections/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (response.ok) {
        fetchCollections();
      }
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
          <p className="mt-2 text-gray-600">
            Organize your artworks into curated collections
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="px-6 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Create Collection
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading collections...</div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No collections found</p>
          <Link
            href="/admin/collections/new"
            className="inline-block mt-4 text-black hover:underline"
          >
            Create your first collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {collection.imageUrl && (
                <div className="aspect-video relative bg-gray-100">
                  <img
                    src={collection.imageUrl}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {collection.name}
                  </h3>
                  {collection.featured && (
                    <span className="text-yellow-500 text-lg">★</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {collection.description || 'No description'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {collection.artworkCount} artworks
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      toggleFeatured(collection.slug, collection.featured)
                    }
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {collection.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <Link
                    href={`/admin/collections/${collection.slug}/edit`}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(collection.slug)}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
