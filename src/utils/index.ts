export const shortenAddress = (addr: string) => {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const veryShortenAddress = (addr: string) => {
  return `${addr.slice(0, 3)}...${addr.slice(-2)}`;
};

export const fewShortenAddress = (addr: string) => {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
