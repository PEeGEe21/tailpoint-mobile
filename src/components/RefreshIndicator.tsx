import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';

interface RefreshIndicatorProps {
  color?: string;
  size?: number;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  color = '#0EA5E9',
  size = 8,
}) => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animateDot = (dot: SharedValue<number>, delay: number) => {
      setTimeout(() => {
        dot.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 300 }),
            withTiming(0, { duration: 300 }),
          ),
          -1,
          false,
        );
      }, delay);
    };

    animateDot(dot1, 0);
    animateDot(dot2, 100);
    animateDot(dot3, 200);

    return () => {
      dot1.value = 0;
      dot2.value = 0;
      dot3.value = 0;
    };
  }, [dot1, dot2, dot3]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(dot1.value, [0, 1], [0, -10]),
      },
    ],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(dot2.value, [0, 1], [0, -10]),
      },
    ],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(dot3.value, [0, 1], [0, -10]),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          animatedStyle1,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          animatedStyle2,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          animatedStyle3,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 4,
  },
});
