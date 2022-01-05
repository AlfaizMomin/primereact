import { useEffect, useRef } from "react";

export const usePrevious = (newValue) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = newValue;
    });
    return ref.current;
}
