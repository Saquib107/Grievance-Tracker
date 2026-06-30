"use client";

import { Bell } from "lucide-react";
import { useNotifications } from "@/components/providers/NotificationProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors outline-none focus:ring-2 focus:ring-indigo-500">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950 flex items-center justify-center text-[8px] text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex justify-between items-center">
            Notifications
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {unreadCount} New
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        
        <div className="flex flex-col max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-l-2 transition-colors ${
                  !notification.isRead ? "bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-500" : "border-transparent opacity-70"
                }`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm ${!notification.isRead ? "font-semibold text-slate-900 dark:text-slate-100" : "font-medium text-slate-700 dark:text-slate-300"}`}>
                      {notification.title}
                    </p>
                    {notification.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notification.description}</p>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-1 text-center flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
