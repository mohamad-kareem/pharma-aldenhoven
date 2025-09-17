// app/user-activity/page.jsx
"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function UserActivityPage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const res = await fetch("/api/activities");
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    };
    if (session?.user?.name === "karim") {
      fetchActivities();
    }
  }, [session]);

  if (!session) return <p>Loading...</p>;
  if (session.user.name !== "karim") return <p>Access denied</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">User Activity</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Page</th>
            <th className="border px-2 py-1">Time</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a) => (
            <tr key={a._id}>
              <td className="border px-2 py-1">{a.username}</td>
              <td className="border px-2 py-1">{a.page}</td>
              <td className="border px-2 py-1">
                {new Date(a.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
