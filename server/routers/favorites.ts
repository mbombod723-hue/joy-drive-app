import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getFavoritesByUserId, addFavorite, deleteFavorite, updateFavorite } from '../db';

export const favoritesRouter = router({
  // Get all favorites for current user
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return await getFavoritesByUserId(ctx.user.id);
    }),

  // Add a new favorite
  add: protectedProcedure
    .input(
      z.object({
        label: z.string().min(1).max(100),
        address: z.string().min(1),
        latitude: z.string(),
        longitude: z.string(),
        icon: z.string().default('MapPin'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await addFavorite({
        userId: ctx.user.id,
        label: input.label,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        icon: input.icon,
      });

      return {
        success: true,
        id: (result as any).insertId,
      };
    }),

  // Delete a favorite
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify the favorite belongs to the user
      const favorites = await getFavoritesByUserId(ctx.user.id);
      const favorite = favorites.find(f => f.id === input.id);

      if (!favorite) {
        throw new Error('Favorite not found or does not belong to user');
      }

      await deleteFavorite(input.id);
      return { success: true };
    }),

  // Update a favorite
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        label: z.string().min(1).max(100).optional(),
        address: z.string().min(1).optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify the favorite belongs to the user
      const favorites = await getFavoritesByUserId(ctx.user.id);
      const favorite = favorites.find(f => f.id === input.id);

      if (!favorite) {
        throw new Error('Favorite not found or does not belong to user');
      }

      const updates: Record<string, any> = {};
      if (input.label !== undefined) updates.label = input.label;
      if (input.address !== undefined) updates.address = input.address;
      if (input.icon !== undefined) updates.icon = input.icon;

      await updateFavorite(input.id, updates);
      return { success: true };
    }),
});
