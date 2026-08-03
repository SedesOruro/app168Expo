import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';

import App from '../../App';

test('renders auth flow by default', async () => {
  render(<App />);

  await waitFor(
    () => {
      expect(screen.getByText('Registro unico.')).toBeTruthy();
    },
    { timeout: 5000 },
  );
});
