import { describe, expect, it } from 'vitest';

import { ENRICHMENT_ORDER, orderSelection } from './steps';

describe('orderSelection', () => {
  it('puts the selection into wizard order', () => {
    expect(orderSelection(['reflection', 'scripture', 'prayer'])).toEqual([
      'scripture',
      'prayer',
      'reflection',
    ]);
  });

  it('drops duplicates', () => {
    expect(orderSelection(['prayer', 'prayer'])).toEqual(['prayer']);
  });

  it('keeps every step when everything is selected', () => {
    expect(orderSelection([...ENRICHMENT_ORDER].reverse())).toEqual(ENRICHMENT_ORDER);
  });
});
