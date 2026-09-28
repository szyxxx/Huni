type WorkspaceSessionStore<T> = {
  getState: () => { syncUserId: string | null };
  setSyncUserId: (userId: string | null) => void;
  hydrateFromRemote: (data: T) => void;
  setSyncError: (message: string | null) => void;
};

export function createWorkspaceSessionController<T>(
  store: WorkspaceSessionStore<T>,
  pull: (userId: string) => Promise<T | null>
) {
  let activeUserId = store.getState().syncUserId;
  let generation = 0;
  let activeLoad: Promise<void> = Promise.resolve();

  return {
    cancel() {
      generation++;
      activeLoad = Promise.resolve();
    },
    setUser(userId: string | null): Promise<void> {
      if (userId === activeUserId && store.getState().syncUserId === userId) return activeLoad;
      activeUserId = userId;
      const requestGeneration = ++generation;
      store.setSyncUserId(userId);
      store.setSyncError(null);
      if (!userId) {
        activeLoad = Promise.resolve();
        return activeLoad;
      }

      activeLoad = (async () => {
        try {
          const remote = await pull(userId);
          if (requestGeneration === generation && store.getState().syncUserId === userId && remote) {
            store.hydrateFromRemote(remote);
          }
        } catch (error) {
          if (requestGeneration === generation && store.getState().syncUserId === userId) {
            store.setSyncError(error instanceof Error ? error.message : 'Gagal menyinkronkan data akun.');
          }
        }
      })();
      return activeLoad;
    },
  };
}
