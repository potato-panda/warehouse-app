export default class IsEmptyObject {
  static evaluate = (object: any): boolean => {
    if (typeof object !== 'object' || object === null) {
      return this.isEmptyValue(object);
    }

    return Object.keys(object).every(key => {
      const value = object[key];
      return typeof value === 'object' && value !== null
        ? IsEmptyObject.evaluate(value)
        : this.isEmptyValue(value);
    });
  };

  private static isEmptyValue(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.length === 0)
    );
  }
}
