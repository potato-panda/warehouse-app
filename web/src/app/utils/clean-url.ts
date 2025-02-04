export default class CleanUrl {
  static transform = (url: string | string [] | null | undefined, ...args: unknown[]): string => {
    if (typeof url === 'string') {
      return url.replace(/{.*?}/g, '');
    } else if (Array.isArray(url)) {
      return url.map(s => s.replace(/{.*?}/g, '')).join('\n');
    }
    return url ?? '';
  };
}
