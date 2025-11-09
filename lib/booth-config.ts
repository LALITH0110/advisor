// Booth configuration from environment variables
export const BOOTH_CONFIG = [
  {
    id: "1",
    name: process.env.BOOTH_1_NAME || "Booth 1",
  },
  {
    id: "2",
    name: process.env.BOOTH_2_NAME || "Booth 2",
  },
  {
    id: "3",
    name: process.env.BOOTH_3_NAME || "Booth 3",
  },
] as const

export function getBoothName(boothId: string): string {
  const booth = BOOTH_CONFIG.find((b) => b.id === boothId)
  return booth?.name || `Booth ${boothId}`
}
