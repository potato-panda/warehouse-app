export default class IdToHrefList {
  static transform = (id: string | number | string [] | number [], propertyUrl: string): string => {
    if (id && propertyUrl) {
      if (typeof id === 'string' || typeof id === 'number') {
        return `${propertyUrl}/${id.toString().trim()}`;
      }
      return id.map(e => `${propertyUrl}/${e.toString().trim()}`).join('\n');
    } else {
      throw new Error('Parameters can not be null, undefined, or empty strings.');
    }
  };
}
