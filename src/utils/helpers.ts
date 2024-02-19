export const showAddress = (str: string) => {
  if (!str || str.length < 8) {
    return '';
  }
  return str.slice(0, 4) + '...' + str.slice(-4);
}

export const calculateRewards = (amount: number, lastDepositTimestamp: number, currentTimeStamp: number) => {

  const timeDiff = currentTimeStamp - lastDepositTimestamp;

  const reward = (amount * 2 / 100) * timeDiff / (60 * 60 * 24);

  return reward;
}
