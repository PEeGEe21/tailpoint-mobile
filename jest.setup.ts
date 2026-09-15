jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
