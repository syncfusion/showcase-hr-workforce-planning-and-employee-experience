import React, { useEffect, useMemo, useState } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { LoadingState } from '../../../components/states/LoadingState';
import { EmptyState } from '../../../components/states/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getChatMessages,
  sendChatMessage,
  CURRENT_USER,
} from '../../../services/employeeExperienceService';

// Default thread used until the panel learns of other threads from message data.
// The backend requires a threadId; the showcase uses the current user's id as
// the canonical self-chat thread (HR-bot / self-thread).
const DEFAULT_THREAD_ID = `thread_${CURRENT_USER.employeeId}`;
import { NOTIFICATION_TYPE_LABELS } from '../employeeExperienceConfig';
import type { NotificationItem, ChatMessage } from '../../../types';

interface Props {
  onUnreadChange?: (count: number) => void;
}

const TYPE_ICON: Record<string, string> = {
  chat: '💬',
  system: '⚙️',
  mention: '📣',
  'status-update': '🔄',
};

// Group chat messages by thread for the thread list.
const groupByThread = (messages: ChatMessage[]): { threadId: string; messages: ChatMessage[] }[] => {
  const map = new Map<string, ChatMessage[]>();
  for (const m of messages) {
    if (!map.has(m.threadId)) map.set(m.threadId, []);
    map.get(m.threadId)!.push(m);
  }
  return Array.from(map.entries()).map(([threadId, msgs]) => ({ threadId, messages: msgs }));
};

export const NotificationsChatPanel: React.FC<Props> = ({ onUnreadChange }) => {
  const [tab, setTab] = useState<'notifications' | 'chat'>('notifications');

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState<string | null>(null);

  // Chat state
  const [threads, setThreads] = useState<{ threadId: string; messages: ChatMessage[] }[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatError, setChatError] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const loadNotifications = async () => {
    try {
      setNotifError(null);
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      setNotifError('Failed to load notifications');
    } finally {
      setNotifLoading(false);
    }
  };

  const loadChat = async () => {
    try {
      setChatError(null);
      const data = await getChatMessages(DEFAULT_THREAD_ID);
      const grouped = groupByThread(data);
      // Always include the default self-thread, even if it has no messages yet.
      const hasDefault = grouped.some((t) => t.threadId === DEFAULT_THREAD_ID);
      const finalThreads = hasDefault
        ? grouped
        : [{ threadId: DEFAULT_THREAD_ID, messages: [] }, ...grouped];
      setThreads(finalThreads);
      if (!activeThreadId && finalThreads.length > 0) {
        setActiveThreadId(finalThreads[0].threadId);
      }
    } catch {
      setChatError('Failed to load messages');
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadChat();
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  useEffect(() => {
    onUnreadChange?.(unreadCount);
  }, [unreadCount, onUnreadChange]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activeThreadId) return;
    setSending(true);
    try {
      const msg = await sendChatMessage(activeThreadId, draft, null);
      setThreads((prev) => prev.map((t) => (t.threadId === activeThreadId ? { ...t, messages: [...t.messages, msg] } : t)));
      setDraft('');
    } catch {
      setChatError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeThread = threads.find((t) => t.threadId === activeThreadId);

  return (
    // The panel must participate in the drawer body's single scroll
    // container. We use a flex column with min-height: 0 so the inner
    // lists can shrink and scroll *inside* the drawer instead of
    // trying to scroll themselves (which previously produced a stuck
    // wheel when the user scrolled over the notifications list).
    <div
      className="ee-card ee-ncp"
      style={{ padding: 12, display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}
    >
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        <ButtonComponent
          cssClass={`ee-subsection-tab ${tab === 'notifications' ? 'active' : ''}`}
          onClick={() => setTab('notifications')}
        >
          🔔 Notifications {unreadCount > 0 && <span className="ee-unread-badge" style={{ marginLeft: 4 }}>{unreadCount}</span>}
        </ButtonComponent>
        <ButtonComponent
          cssClass={`ee-subsection-tab ${tab === 'chat' ? 'active' : ''}`}
          onClick={() => setTab('chat')}
        >
          💬 Chat
        </ButtonComponent>
      </div>

      {tab === 'notifications' && (
        // flex: 1 + min-height: 0 lets this list expand to fill the
        // remaining drawer body and become *the* scroll container.
        // No fixed maxHeight — that previously created a second scroll
        // bar that competed with the drawer's outer scroll and
        // appeared to "break" when the user tried to scroll past it.
        <div className="ee-ncp__scroll" style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
          {notifLoading ? (
            <LoadingState height="120px" />
          ) : notifError ? (
            <ErrorState message={notifError} onRetry={loadNotifications} />
          ) : notifications.length === 0 ? (
            <EmptyState title="No notifications" description="Status updates and mentions will appear here." />
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ButtonComponent cssClass="e-flat ee-link-btn" onClick={handleMarkAllRead}>Mark all read</ButtonComponent>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="ee-card"
                  style={{ padding: 10, borderLeft: n.read ? '3px solid #e0e0e0' : '3px solid #3B8CDE' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#212529' }}>
                        {TYPE_ICON[n.type]} {n.title}
                      </div>
                      {n.body && <div style={{ fontSize: 12, color: '#495057', marginTop: 2 }}>{n.body}</div>}
                      <div className="ee-muted" style={{ marginTop: 4 }}>
                        {NOTIFICATION_TYPE_LABELS[n.type]} • {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!n.read && (
                      <ButtonComponent cssClass="e-flat ee-link-btn" onClick={() => handleMarkRead(n.id)}>Mark read</ButtonComponent>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'chat' && (
        // Same flex/min-height:0 treatment as the notifications list so
        // the chat thread also yields to the drawer's single scroll
        // container instead of opening its own competing one.
        <div className="ee-ncp__scroll" style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
          {chatLoading ? (
            <LoadingState height="120px" />
          ) : chatError ? (
            <ErrorState message={chatError} onRetry={loadChat} />
          ) : threads.length === 0 ? (
            <EmptyState title="No conversations" description="Start a thread related to a request or issue." />
          ) : (
            <>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                {threads.map((t) => (
                  <ButtonComponent
                    key={t.threadId}
                    cssClass={`ee-subsection-tab ${activeThreadId === t.threadId ? 'active' : ''}`}
                    onClick={() => setActiveThreadId(t.threadId)}
                    style={{ whiteSpace: 'nowrap', fontSize: 11 }}
                    title={t.threadId}
                  >
                    {t.threadId.replace('thread_', '')}
                  </ButtonComponent>
                ))}
              </div>

              <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, padding: 4 }}>
                {activeThread?.messages.map((m) => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.fromId === 'emp_4521' ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        background: m.fromId === 'emp_4521' ? '#3B8CDE' : '#f0f0f0',
                        color: m.fromId === 'emp_4521' ? '#fff' : '#212529',
                        padding: '6px 10px', borderRadius: 10, maxWidth: '80%', fontSize: 12,
                      }}
                    >
                      {m.body}
                    </div>
                    <div className="ee-muted" style={{ fontSize: 10, marginTop: 2 }}>
                      {m.fromName} • {new Date(m.sentAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} style={{ display: 'flex', gap: 6 }}>
                <TextBoxComponent
                  value={draft}
                  change={(e: any) => setDraft((e.value ?? '').toString())}
                  placeholder={activeThreadId ? 'Type a message…' : 'Select a thread'}
                  disabled={!activeThreadId || sending}
                  aria-label="Message"
                  cssClass="ee-chat-input"
                />
                <ButtonComponent
                  cssClass="e-primary"
                  disabled={!activeThreadId || sending || !draft.trim()}
                  type="submit"
                >
                  {sending ? '…' : 'Send'}
                </ButtonComponent>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
