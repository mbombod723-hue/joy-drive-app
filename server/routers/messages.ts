import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { messages, conversations } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const messagesRouter = router({
  // Get or create conversation
  getOrCreateConversation: protectedProcedure
    .input(
      z.object({
        driverId: z.number(),
        tripId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Check if conversation exists
      const existing = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.userId, ctx.user.id),
            eq(conversations.driverId, input.driverId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      // Create new conversation
      const result = await db.insert(conversations).values({
        userId: ctx.user.id,
        driverId: input.driverId,
        tripId: input.tripId,
        isActive: 1,
      });

      // Get the created conversation (return the inserted values)
      return {
        id: Number((result as any).insertId || 0),
        userId: ctx.user.id,
        driverId: input.driverId,
        tripId: input.tripId || null,
        lastMessage: null,
        lastMessageTime: null,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  // Send message
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify conversation belongs to user
      const conv = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, input.conversationId),
            eq(conversations.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (conv.length === 0) {
        throw new Error('Conversation not found');
      }

      // Insert message
      const result = (await db.insert(messages).values({
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        senderType: 'user',
        content: input.content,
        isRead: 0,
      })) as any;

      // Update conversation last message
      await db
        .update(conversations)
        .set({
          lastMessage: input.content,
          lastMessageTime: new Date(),
        })
        .where(eq(conversations.id, input.conversationId));

      // Return the created message
      return {
        id: Number(result.insertId || 0),
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        senderType: 'user' as const,
        content: input.content,
        isRead: 0,
        readAt: null,
        createdAt: new Date(),
      };
    }),

  // Get messages for conversation
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify conversation belongs to user
      const conv = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, input.conversationId),
            eq(conversations.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (conv.length === 0) {
        throw new Error('Conversation not found');
      }

      // Get messages
      const msgs = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(messages.createdAt)
        .limit(input.limit)
        .offset(input.offset);

      return msgs;
    }),

  // Mark messages as read
  markAsRead: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Update unread messages
      await db
        .update(messages)
        .set({
          isRead: 1,
          readAt: new Date(),
        })
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            eq(messages.isRead, 0)
          )
        );

      return { success: true };
    }),

  // Get all conversations for user
  getConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const convs = await db
        .select()
        .from(conversations)
        .where(eq(conversations.userId, ctx.user.id))
        .orderBy(conversations.updatedAt)
        .limit(input.limit)
        .offset(input.offset);

      return convs;
    }),

  // Delete conversation
  deleteConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify conversation belongs to user
      const conv = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, input.conversationId),
            eq(conversations.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (conv.length === 0) {
        throw new Error('Conversation not found');
      }

      // Delete messages first
      await db
        .delete(messages)
        .where(eq(messages.conversationId, input.conversationId));

      // Delete conversation
      await db
        .delete(conversations)
        .where(eq(conversations.id, input.conversationId));

      return { success: true };
    }),
});
