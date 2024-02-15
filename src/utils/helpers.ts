export const addressShow = (str: string) => {
  if(!str || str.length < 8) {
    return '';
  }
  return str.slice(0, 4) + '...' + str.slice(-4);
}

export const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}

export const containsUrl = (str: string) => {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return urlRegex.test(str);
}

export const createArray = (n: number) => {
  const arr = [];
  for (let i = 1; i <= n; i++) {
    arr.push(i);
  }
  return arr;
}
