import { useState, useEffect, useCallback } from 'react';
import { Review } from '../types';
import { reviewsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useReviews = (productId?: string) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews]     = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setIsLoading(true);
    reviewsApi.getByProduct(productId)
      .then((data) => { if (!cancelled) setReviews(data); })
      .catch((err) => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [productId]);

  const addReview = useCallback(async (
    rating: number,
    comment: string,
    targetProductId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !isAuthenticated) return { success: false, error: 'Please log in to leave a review.' };
    try {
      const review: Omit<Review, 'id'> = {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        productId: targetProductId,
        rating,
        comment,
        createdAt: new Date().toISOString().split('T')[0],
      };
      const created = await reviewsApi.create(review);
      if (targetProductId === productId) {
        setReviews((prev) => [created, ...prev]);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, [user, isAuthenticated, productId]);

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      await reviewsApi.delete(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, []);

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return { reviews, isLoading, error, addReview, deleteReview, averageRating };
};
