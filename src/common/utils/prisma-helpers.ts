export function toPrismaId(id: string | number | bigint | undefined | null): bigint | undefined {
  if (id === undefined || id === null) return undefined;
  if (typeof id === 'bigint') return id;
  if (typeof id === 'number') return BigInt(id);
  if (typeof id === 'string' && id.trim().length > 0) return BigInt(id);
  return undefined;
}
