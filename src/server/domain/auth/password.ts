import { timingSafeEqual } from "node:crypto";

function toBuffer(value: string): Buffer {
  return Buffer.from(value.normalize("NFKC"), "utf8");
}

export function verifyPlainPassword(input: string, expected: string): boolean {
  const inputBuffer = toBuffer(input);
  const expectedBuffer = toBuffer(expected);

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, expectedBuffer);
}
