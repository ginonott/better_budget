import { useState, useEffect } from "react";

type callback = () => any;

export const useSubscribe = (
  subscribe: (cb: callback) => any,
  unsubscribe: (cb: callback) => any
) => {
  const [timestamp, setTimestamp] = useState<number>(0);
  const cb = () => {
    setTimestamp(Date.now());
  };

  useEffect(() => {
    subscribe(cb);

    return () => {
      unsubscribe(cb);
    };
  });

  return timestamp;
};
