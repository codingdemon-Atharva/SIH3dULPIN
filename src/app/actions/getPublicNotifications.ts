"use server";

export interface PublicNotification {
  id: string;
  title: string;
  description: string;
  date: string;
  category: "System Update" | "Land Records" | "ULPIN" | "Maintenance" | "Public Notice";
  isRead?: boolean;
}

export async function getPublicNotifications() {
  try {
    // Strictly returns public notifications appropriate for citizen/public users.
    // In current database schema, no notification table exists.
    // Return empty list and zero unread count rather than fake production notification data.
    const notifications: PublicNotification[] = [];
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      success: true,
      notifications,
      unreadCount,
    };
  } catch (error) {
    console.error("Failed to fetch public notifications:", error);
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      error: "Unable to load public notifications.",
    };
  }
}
