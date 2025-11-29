'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Artwork {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  status: string;
  featured: boolean;
  artist: {
    name: string;
  };
  category: {
    name: string;
  };
  createdAt: string;
}

export default function AdminArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchArtworks();
  }, [filter]);

  const fetchArtworks = async () => {
    try {
      let url = '/api/artworks';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setArtworks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;

    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArtworks(artworks.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting artwork:', error);
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (response.ok) {
        fetchArtworks();
      }
    } catch (error) {
      console.error('Error updating artwork:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Artworks</h1>
          <p className="mt-2 text-gray-600">
            Manage your gallery's artwork collection
          </p>
        </div>
        <Link
          href="/admin/artworks/new"
          className="px-6 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Add Artwork
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['all', 'AVAILABLE', 'SOLD', 'RESERVED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === status
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Artworks Table */}
      {loading ? (
        <div className="text-center py-12">Loading artworks...</div>
      ) : artworks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No artworks found</p>
          <Link
            href="/admin/artworks/new"
            className="inline-block mt-4 text-black hover:underline"
          >
            Create your first artwork
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artwork
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {artworks.map((artwork) => (
                <tr key={artwork.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 relative">
                        <Image
                          src={artwork.imageUrl || '/placeholder.jpg'}
                          alt={artwork.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {artwork.title}
                        </div>
                        {artwork.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {artwork.artist.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {artwork.category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${artwork.price?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        artwork.status === 'AVAILABLE'
                          ? 'bg-green-100 text-green-800'
                          : artwork.status === 'SOLD'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {artwork.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => toggleFeatured(artwork.id, artwork.featured)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title={artwork.featured ? 'Unfeature' : 'Feature'}
                    >
                      {artwork.featured ? '★' : '☆'}
                    </button>
                    <Link
                      href={`/admin/artworks/${artwork.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(artwork.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
