'use client';

import { useGetUsersQuery } from '@/features/users/usersApi';
import { gsap } from 'gsap';
import { Edit, Mail, MoreHorizontal, Shield, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

const MOCK_USERS = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', lastActive: '2 hours ago' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Inactive', lastActive: '1 day ago' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer', status: 'Active', lastActive: '15 mins ago' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Admin', status: 'Active', lastActive: 'Just now' },
  { id: 5, name: 'Edward Norton', email: 'edward@example.com', role: 'Editor', status: 'Pending', lastActive: '5 hours ago' },
];

interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

export default function UserTable() {
  const { data: usersResponse, isLoading, error } = useGetUsersQuery(undefined);
  if (error) console.error('Fetch users error:', error);
  const tableRef = useRef<HTMLTableElement>(null);

  // Use mock data if API fails or returns nothing (for demo purposes)
  const users = usersResponse?.data || MOCK_USERS;

  useEffect(() => {
    if (tableRef.current) {
      gsap.fromTo(
        tableRef.current.querySelectorAll('tbody tr'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [users]);

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table ref={tableRef} className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold tracking-wider">
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Last Active</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user: User) => (
            <tr key={user.id} className="hover:bg-secondary/30 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center text-primary font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                      <Mail className="w-3 h-3 mr-1" />
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center text-sm font-medium">
                  <Shield className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  {user.role}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                  user.status === 'Inactive' ? 'bg-muted text-muted-foreground' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                {user.lastActive}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-primary/10 rounded-md text-primary transition-colors" title="Edit User">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-destructive/10 rounded-md text-destructive transition-colors" title="Delete User">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-secondary rounded-md text-muted-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          No users found.
        </div>
      )}

      <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground font-medium">
        <div>Showing {users.length} of {users.length * 2} users</div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-border rounded hover:bg-secondary disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 bg-primary text-primary-foreground rounded">1</button>
          <button className="px-3 py-1 border border-border rounded hover:bg-secondary">2</button>
          <button className="px-3 py-1 border border-border rounded hover:bg-secondary">Next</button>
        </div>
      </div>
    </div>
  );
}