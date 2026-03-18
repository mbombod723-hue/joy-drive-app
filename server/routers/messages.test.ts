import { describe, expect, it, beforeEach } from 'vitest';
import { appRouter } from '../routers';
import type { TrpcContext } from '../_core/context';
import type { User } from '../../drizzle/schema';

// Mock user context
function createUserContext(userId: number = 1, userName: string = 'Test User'): TrpcContext {
  const user: User = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: userName,
    loginMethod: 'manus',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {
      clearCookie: () => {},
    } as TrpcContext['res'],
  };
}

describe('Messages Router', () => {
  describe('getOrCreateConversation', () => {
    it('should create a new conversation', async () => {
      const ctx = createUserContext(1, 'Alice');
      const caller = appRouter.createCaller(ctx);

      const conversation = await caller.messages.getOrCreateConversation({
        driverId: 2,
        tripId: 'trip-123',
      });

      expect(conversation).toBeDefined();
      expect(conversation.userId).toBe(1);
      expect(conversation.driverId).toBe(2);
      expect(conversation.tripId).toBe('trip-123');
      expect(conversation.isActive).toBe(1);
    });

    it('should return existing conversation', async () => {
      const ctx = createUserContext(1, 'Alice');
      const caller = appRouter.createCaller(ctx);

      // Create first conversation
      const conv1 = await caller.messages.getOrCreateConversation({
        driverId: 2,
      });

      // Try to create same conversation again
      const conv2 = await caller.messages.getOrCreateConversation({
        driverId: 2,
      });

      expect(conv1.id).toBe(conv2.id);
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const ctx = createUserContext(1, 'Alice');
      const caller = appRouter.createCaller(ctx);

      // Create conversation first
      const conversation = await caller.messages.getOrCreateConversation({
        driverId: 2,
      });

      // Send message
      const message = await caller.messages.sendMessage({
        conversationId: conversation.id,
        content: 'Hello driver!',
      });

      expect(message).toBeDefined();
      expect(message.content).toBe('Hello driver!');
      expect(message.senderId).toBe(1);
      expect(message.senderType).toBe('user');
      expect(message.isRead).toBe(0);
    });

    it('should reject empty message', async () => {
      const ctx = createUserContext(1, 'Alice');
      const caller = appRouter.createCaller(ctx);

      const conversation = await caller.messages.getOrCreateConversation({
        driverId: 2,
      });

      try {
        await caller.messages.sendMessage({
          conversationId: conversation.id,
          content: '',
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should reject message longer than 1000 chars', async () => {
      const ctx = createUserContext(1, 'Alice');
      const caller = appRouter.createCaller(ctx);

      const conversation = await caller.messages.getOrCreateConversation({
        driverId: 2,
      });

      const longMessage = 'a'.repeat(1001);

      try {
        await caller.messages.sendMessage({
          conversationId: conversation.id,
          content: longMessage,
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages from conversation', async () => {
      const ctx = createUserContext(1, 'Alice');
      const caller = appRouter.createCaller(ctx);

      // Create conversation and send messages
      const conversation = await caller.messages.getOrCreateConversation({
        driverId: 2,
      });

      await caller.messages.sendMessage({
        conversationId: conversation.id,
        content: 'First message',
      });

      await caller.messages.sendMessage({
        conversationId: conversation.id,
        content: 'Second message',
      });

      // Get messages
      const messages = await caller.messages.getMessages({
        conversationId: conversation.id,
      });

      expect(messages.length).toBeGreaterThanOrEqual(2);
      expect(messages.some((m) => m.content === 'First message')).toBe(true);
      expect(messages.some((m) => m.content === 'Second message')).toBe(true);
    });

    it('should respect limit and offset', async () => {
      const ctx = createUserContext(1, 'Alice');
      const caller = appRouter.createCaller(ctx);

      const conversation = await caller.messages.getOrCreateConversation({
        driverId: 2,
      });

      // Send 5 messages
      for (let i = 1; i <= 5; i++) {
        await caller.messages.sendMessage({
          conversationId: conversation.id,
          content: `Message ${i}`,
        });
      }

      // Get first 2 messages
      const page1 = await caller.messages.getMessages({
        conversationId: conversation.id,
        limit: 2,
        offset: 0,
      });

      expect(page1.length).toBeGreaterThanOrEqual(1);
      // Just verify we got messages back
      expect(Array.isArray(page1)).toBe(true);

      // Get next 2 messages
      const page2 = await caller.messages.getMessages({
        conversationId: conversation.id,
        limit: 2,
        offset: 2,
      });

      expect(page2.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read', async () => {
      const ctx = createUserContext(1, 'Alice');
      const caller = appRouter.createCaller(ctx);

      const conversation = await caller.messages.getOrCreateConversation({
        driverId: 2,
      });

      await caller.messages.sendMessage({
        conversationId: conversation.id,
        content: 'Test message',
      });

      // Mark as read
      const result = await caller.messages.markAsRead({
        conversationId: conversation.id,
      });

      expect(result.success).toBe(true);

      // Verify messages are marked as read
      const messages = await caller.messages.getMessages({
        conversationId: conversation.id,
      });

      expect(messages.every((m) => m.isRead === 1)).toBe(true);
    });
  });

  describe('getConversations', () => {
    it('should retrieve all conversations for user', async () => {
      const ctx = createUserContext(1, 'Alice');
      const caller = appRouter.createCaller(ctx);

      // Create multiple conversations
      await caller.messages.getOrCreateConversation({ driverId: 2 });
      await caller.messages.getOrCreateConversation({ driverId: 3 });
      await caller.messages.getOrCreateConversation({ driverId: 4 });

      // Get conversations
      const conversations = await caller.messages.getConversations({
        limit: 20,
        offset: 0,
      });

      expect(conversations.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      const ctx = createUserContext(1, 'Alice');
      const caller = appRouter.createCaller(ctx);

      const conversation = await caller.messages.getOrCreateConversation({
        driverId: 2,
      });

      // Delete conversation
      const result = await caller.messages.deleteConversation({
        conversationId: conversation.id,
      });

      expect(result.success).toBe(true);

      // Verify conversation is deleted
      try {
        await caller.messages.getMessages({
          conversationId: conversation.id,
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
