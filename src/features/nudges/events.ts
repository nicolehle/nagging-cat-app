type NudgeChangeListener = () => void;

const listeners = new Set<NudgeChangeListener>();

export function subscribeToNudgeChanges(listener: NudgeChangeListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function notifyNudgesChanged() {
  listeners.forEach((listener) => {
    listener();
  });
}
