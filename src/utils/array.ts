export const DistinctArray = <ArrayModel>(
  list: (ArrayModel | null)[],
  customCondition?: (item: ArrayModel) => boolean,
) => {
  const arr: ArrayModel[] = [];

  for (let i = 0; i < list.length; i++) {
    const item = list[i];

    if (item === null) continue;

    if (customCondition) {
      if (customCondition(item)) arr.push(item);
    } else {
      if (!arr.includes(item)) arr.push(item);
    }
  }

  return arr;
};
