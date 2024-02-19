export const showAddress = (str: string) => {
  if(!str || str.length < 8) {
    return '';
  }
  return str.slice(0, 4) + '...' + str.slice(-4);
}
