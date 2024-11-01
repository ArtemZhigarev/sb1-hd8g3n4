import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, AlertCircle, User } from 'lucide-react';

interface WooCommerceUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
}

const UserSearch: React.FC = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [users, setUsers] = useState<WooCommerceUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async (email: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const wooCommerceUrl = localStorage.getItem('woocommerce_url');
      const consumerKey = localStorage.getItem('woocommerce_consumer_key');
      const consumerSecret = localStorage.getItem('woocommerce_consumer_secret');

      if (!wooCommerceUrl || !consumerKey || !consumerSecret) {
        throw new Error('WooCommerce settings are not configured. Please set them in the WooCommerce Settings page.');
      }

      const response = await axios.get(`${wooCommerceUrl}/wp-json/wc/v3/customers`, {
        auth: {
          username: consumerKey,
          password: consumerSecret
        },
        params: {
          email: email,
          per_page: 20,
          page: page
        }
      });

      setUsers(prevUsers => {
        const newUsers = response.data.filter((newUser: WooCommerceUser) => 
          !prevUsers.some(existingUser => existingUser.id === newUser.id)
        );
        return [...prevUsers, ...newUsers];
      });
      setHasMore(response.data.length === 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers([]);
    setPage(1);
    fetchUsers(searchEmail);
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">User Search</h1>
      <form onSubmit={handleSearch} className="flex space-x-2">
        <input
          type="email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Search by email"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <div className="flex">
            <div className="py-1">
              <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
            </div>
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                  ID: {user.id}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {loading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Load More
          </button>
        </div>
      )}

      {!loading && users.length === 0 && (
        <p className="text-gray-500 text-center">No users found. Try searching for a user by email or check your WooCommerce settings.</p>
      )}
    </div>
  );
};

export default UserSearch;