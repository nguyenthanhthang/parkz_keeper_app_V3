module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated/plugin phải để cuối danh sách nếu có dùng Reanimated
      // 'react-native-reanimated/plugin',
    ],
  };
};

