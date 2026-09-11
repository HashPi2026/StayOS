// API client utility stub for future backend integration
export const apiClient = {
  get: async <T>(url: string): Promise<T> => {
    const res = await fetch(url);
    return res.json();
  },
  post: async <T>(url: string, data: unknown): Promise<T> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
