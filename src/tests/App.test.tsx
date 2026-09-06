import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';

import App from '../../App';

/**
 * Al arrancar sin sesion la aplicacion muestra primero la presentacion
 * institucional y, pasados unos segundos, el registro por secciones.
 */
test('muestra la presentacion y luego el registro', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText('Emergencias 168')).toBeTruthy();
  });

  await waitFor(
    () => {
      expect(screen.getByText('Vamos a conocerte')).toBeTruthy();
    },
    { timeout: 6000 },
  );
}, 15000);
