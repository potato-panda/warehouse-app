type hasId = { id: string | number };

export default class UniqueId {
  static filter = <T extends hasId>(array: T[]) => {
    return array.filter(v => v).reduce((previousValue, currentValue) => {
      if (!previousValue.some(v => v.id === currentValue.id)) {
        return [...previousValue, currentValue];
      }
      return previousValue;
    }, [] as T[]);
  };
}
