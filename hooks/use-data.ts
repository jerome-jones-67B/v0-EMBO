// React hooks for data fetching with the data service

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '@/lib/data-service';
import type {
  Manuscript,
  Figure,
  LinkedDataEntry,
  SourceData,
  Author,
  Comment,
  Task,
  Notification,
  PaginatedResponse,
  ApiResponse,
} from '@/lib/types';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T> | PaginatedResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if ('pagination' in response) {
        setData(response.data);
      } else {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Specific hooks for different data types
export function useManuscripts(params?: {
  page?: number;
  limit?: number;
  status?: string;
  assignedTo?: string;
  priority?: string;
}) {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManuscripts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataService.getManuscripts(params);
      setManuscripts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch manuscripts');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchManuscripts();
  }, [fetchManuscripts]);

  return { manuscripts, pagination, loading, error, refetch: fetchManuscripts };
}

export function useManuscript(id: string) {
  return useApi(
    () => dataService.getManuscriptById(id),
    [id]
  );
}

export function useFigures(params?: { manuscriptId?: string; page?: number; limit?: number }) {
  const [figures, setFigures] = useState<Figure[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFigures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataService.getFigures(params);
      setFigures(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch figures');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchFigures();
  }, [fetchFigures]);

  return { figures, pagination, loading, error, refetch: fetchFigures };
}

export function useFigure(id: string) {
  return useApi(
    () => dataService.getFigureById(id),
    [id]
  );
}

export function useLinkedData(params?: { type?: string; page?: number; limit?: number }) {
  const [linkedData, setLinkedData] = useState<LinkedDataEntry[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinkedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataService.getLinkedData(params);
      setLinkedData(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch linked data');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLinkedData();
  }, [fetchLinkedData]);

  return { linkedData, pagination, loading, error, refetch: fetchLinkedData };
}

export function useComments(manuscriptId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    // Comments are not available in Data4Rev API
    // This would need to be implemented separately
    setComments([]);
    setLoading(false);
  }, []);

  const addComment = useCallback(async (content: string, type: string = 'general') => {
    // Comments are not available in Data4Rev API
    setError('Comments are not available in Data4Rev API');
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, error, refetch: fetchComments, addComment };
}

export function useTasks(params?: {
  manuscriptId?: string;
  assignedTo?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    // Tasks are not available in Data4Rev API
    // This would need to be implemented separately
    setTasks([]);
    setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, pagination, loading, error, refetch: fetchTasks };
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    // Notifications are not available in Data4Rev API
    // This would need to be implemented separately
    setNotifications([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, loading, error, refetch: fetchNotifications };
}

export function useSearch(query: string, enabled: boolean = true) {
  const [results, setResults] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!enabled || !query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await dataService.searchManuscripts(query);
      setResults(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [query, enabled]);

  useEffect(() => {
    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  return { results, loading, error };
}

export function useStatistics() {
  return useApi(
    () => dataService.getStatistics(),
    []
  );
}

// Hook for managing manuscript updates
export function useManuscriptActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateManuscript = useCallback(async (id: string, data: Partial<Manuscript>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataService.updateManuscript(id, data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update manuscript';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createManuscript = useCallback(async (data: Partial<Manuscript>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dataService.createManuscript(data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create manuscript';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateManuscript, createManuscript, loading, error };
}