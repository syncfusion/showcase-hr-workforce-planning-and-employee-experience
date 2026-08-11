// NotificationsChatPanel — mirrors
// src/screens/EmployeeExperience/components/NotificationsChatPanel.tsx
//
// Two-tab drawer panel:
//   • Notifications — list of NotificationItem with mark-read/mark-all-read
//   • Chat          — thread list (grouped by threadId) with send message
//
// The panel never opens itself; the parent owns the open/close state and
// re-mounts it on demand. We still call onUnreadChange whenever the
// notifications tab is rendered, so the parent can keep its bell badge in
// sync even when the panel was just closed.

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';

import { EmployeeExperienceService, CURRENT_USER } from '../../../services/employee-experience.service';
import { NOTIFICATION_TYPE_LABELS } from '../employee-experience.config';
import type {
  NotificationItem,
  ChatMessage,
  NotificationType,
} from '../../../models/employee-experience.model';
import { LoadingStateComponent } from '../../../components/states/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../components/states/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../components/states/error-state/error-state.component';

type TabId = 'notifications' | 'chat';

// Default self-chat thread — the backend requires a threadId for both reads
// and writes. The showcase treats the current user's id as the canonical
// self-thread (HR-bot / self-thread).
const DEFAULT_THREAD_ID = `thread_${CURRENT_USER.employeeId}`;

const TYPE_ICON: Record<NotificationType, string> = {
  chat: '💬',
  system: '⚙️',
  mention: '📣',
  'status-update': '🔄',
};

interface ThreadGroup {
  threadId: string;
  messages: ChatMessage[];
}

const groupByThread = (messages: ChatMessage[]): ThreadGroup[] => {
  const map = new Map<string, ChatMessage[]>();
  for (const m of messages) {
    const list = map.get(m.threadId) ?? [];
    list.push(m);
    map.set(m.threadId, list);
  }
  return Array.from(map.entries()).map(([threadId, msgs]) => ({
    threadId,
    messages: msgs,
  }));
};

@Component({
  selector: 'app-notifications-chat-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TextBoxModule,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './notifications-chat-panel.component.html',
  styleUrl: './notifications-chat-panel.component.css',
})
export class NotificationsChatPanelComponent implements OnInit {
  private readonly service = inject(EmployeeExperienceService);

  /** Notified every time the unread count changes while the panel is open. */
  @Output() readonly unreadChange = new EventEmitter<number>();

  protected readonly currentUserId = CURRENT_USER.employeeId;
  protected readonly currentUserName = CURRENT_USER.employeeName;

  protected readonly activeTab = signal<TabId>('notifications');

  // Notifications
  protected readonly notifications = signal<NotificationItem[]>([]);
  protected readonly notifLoading = signal(true);
  protected readonly notifError = signal<string | null>(null);

  // Chat
  protected readonly threads = signal<ThreadGroup[]>([]);
  protected readonly chatLoading = signal(true);
  protected readonly chatError = signal<string | null>(null);
  protected readonly activeThreadId = signal<string | null>(null);
  protected readonly draft = signal('');
  protected readonly sending = signal(false);

  protected readonly unreadCount = computed<number>(
    () => this.notifications().filter((n) => !n.read).length,
  );

  protected readonly activeThread = computed<ThreadGroup | undefined>(() => {
    const id = this.activeThreadId();
    if (!id) return undefined;
    return this.threads().find((t) => t.threadId === id);
  });

  ngOnInit(): void {
    void this.loadNotifications();
    void this.loadChat();
  }

  protected setTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  // Stable function references for the error-state input bindings.
  // We can't use `.bind(this)` directly in the template, and the input
  // expects a real function (not a method reference, which would change
  // identity on every change-detection pass).
  protected readonly retryNotifications = (): void => {
    void this.loadNotifications();
  };
  protected readonly retryChat = (): void => {
    void this.loadChat();
  };

  protected async loadNotifications(): Promise<void> {
    try {
      this.notifError.set(null);
      const data = await this.service.getNotifications();
      this.notifications.set(data);
    } catch {
      this.notifError.set('Failed to load notifications');
    } finally {
      this.notifLoading.set(false);
      this.unreadChange.emit(this.unreadCount());
    }
  }

  protected async loadChat(): Promise<void> {
    try {
      this.chatError.set(null);
      const data = await this.service.getChatMessages(DEFAULT_THREAD_ID);
      const grouped = groupByThread(data);
      const hasDefault = grouped.some((t) => t.threadId === DEFAULT_THREAD_ID);
      const finalThreads: ThreadGroup[] = hasDefault
        ? grouped
        : [{ threadId: DEFAULT_THREAD_ID, messages: [] }, ...grouped];
      this.threads.set(finalThreads);
      if (!this.activeThreadId() && finalThreads.length > 0) {
        this.activeThreadId.set(finalThreads[0].threadId);
      }
    } catch {
      this.chatError.set('Failed to load messages');
    } finally {
      this.chatLoading.set(false);
    }
  }

  protected async markRead(id: string): Promise<void> {
    try {
      await this.service.markNotificationRead(id);
      this.notifications.update((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      this.unreadChange.emit(this.unreadCount());
    } catch {
      this.notifError.set('Failed to mark notification as read');
    }
  }

  protected async markAllRead(): Promise<void> {
    try {
      await this.service.markAllNotificationsRead();
      this.notifications.update((prev) =>
        prev.map((n) => ({ ...n, read: true })),
      );
      this.unreadChange.emit(this.unreadCount());
    } catch {
      this.notifError.set('Failed to mark notifications as read');
    }
  }

  protected setActiveThread(threadId: string): void {
    this.activeThreadId.set(threadId);
  }

  protected onDraftInput(value: string): void {
    this.draft.set(value ?? '');
  }

  protected async sendMessage(event: Event): Promise<void> {
    event.preventDefault();
    const threadId = this.activeThreadId();
    const body = this.draft().trim();
    if (!body || !threadId || this.sending()) return;

    this.sending.set(true);
    try {
      const msg = await this.service.sendChatMessage(threadId, body, null);
      this.threads.update((prev) =>
        prev.map((t) =>
          t.threadId === threadId
            ? { ...t, messages: [...t.messages, msg] }
            : t,
        ),
      );
      this.draft.set('');
    } catch {
      this.chatError.set('Failed to send message');
    } finally {
      this.sending.set(false);
    }
  }

  protected isOwnMessage(fromId: string): boolean {
    return fromId === this.currentUserId;
  }

  protected iconFor(type: NotificationType): string {
    return TYPE_ICON[type] ?? '';
  }

  protected labelFor(type: NotificationType): string {
    return NOTIFICATION_TYPE_LABELS[type] ?? type;
  }

  protected formatTime(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString();
    } catch {
      return iso;
    }
  }

  protected formatDateTime(iso: string): string {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  protected stripThreadPrefix(threadId: string): string {
    return threadId.replace(/^thread_/, '');
  }
}
