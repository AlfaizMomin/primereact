import { useEffect } from 'react';

export const useUnmountEffect = (fn) => useEffect(() => fn, []);
