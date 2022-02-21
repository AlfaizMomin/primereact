import { useEffect } from 'react';

export const useMountEffect = (listener) => useEffect(() => listener && listener(), []);
