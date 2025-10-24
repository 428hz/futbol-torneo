import React from 'react';
import { Platform } from 'react-native';

let Comp: React.ComponentType<any>;

if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Comp = require('./MatchDetailScreen.web').default;
} else {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Comp = require('./MatchDetailScreen.native').default;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Comp = require('./MatchDetailScreen.web').default;
  }
}

export default Comp;