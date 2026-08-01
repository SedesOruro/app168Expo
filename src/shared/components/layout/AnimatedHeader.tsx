import React, { ReactElement, useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { AppHeader } from './AppHeader';

type AnimatedHeaderProps = React.ComponentProps<typeof AppHeader>;

export const AnimatedHeader = (props: AnimatedHeaderProps): ReactElement => {
  const [translateY] = useState(() => new Animated.Value(-18));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        easing: Easing.bezier(0.2, 0, 0, 1),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <AppHeader {...props} />
    </Animated.View>
  );
};
