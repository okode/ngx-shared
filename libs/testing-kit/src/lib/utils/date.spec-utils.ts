export const fakeTimer = (isoDate: string) => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(isoDate));
};
