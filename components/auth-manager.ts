type Callback = () => void;

let callback: Callback | null = null;

export const authManager = {
  subscribe(cb: Callback) {
    callback = cb;

    return () => {
      callback = null;
    };
  },

  open() {
    callback?.();
  },
};
