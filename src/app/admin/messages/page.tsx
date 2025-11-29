'use client';

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      const url = filter ? `/api/contact?status=${filter}` : '/api/contact';
      const response = await fetch(url);
      const data = await response.json();
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
        <p className="mt-2 text-gray-600">
          View and manage contact form submissions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['PENDING', 'REPLIED', 'RESOLVED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === status
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No messages found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div
                key={message.id}
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {message.name}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          message.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : message.status === 'REPLIED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {message.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{message.email}</p>
                    {message.subject && (
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Subject: {message.subject}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {message.message}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Message Details
              </h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  From
                </label>
                <p className="mt-1 text-gray-900">{selectedMessage.name}</p>
                <p className="text-sm text-gray-600">{selectedMessage.email}</p>
              </div>

              {selectedMessage.subject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <p className="mt-1 text-gray-900">{selectedMessage.subject}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Received
                </label>
                <p className="mt-1 text-gray-600">
                  {formatDate(selectedMessage.createdAt)}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors text-center"
                >
                  Reply via Email
                </a>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
