import { expect, test } from 'vitest';
import { buildTourHtml, safeTourUrl } from '../src/lib/virtualTourHtml';

test('virtual tours reject unsafe URL schemes and credentials', () => {
  expect(safeTourUrl('javascript:alert(1)')).toBeNull();
  expect(safeTourUrl('http://example.com/tour.glb')).toBeNull();
  expect(safeTourUrl('https://user:pass@example.com/tour.glb')).toBeNull();
  expect(safeTourUrl('https://example.com/tour.glb')).toBe('https://example.com/tour.glb');
});

test('model URL cannot break out of its HTML attribute', () => {
  const html = buildTourHtml('https://example.com/tour.glb?name=" onerror="alert(1)', 'model3d');
  expect(html).not.toContain('src="https://example.com/tour.glb?name=" onerror=');
  expect(html).toContain('<model-viewer src="https://example.com/tour.glb?');
});

test('panorama URL cannot close its script element', () => {
  const html = buildTourHtml('https://example.com/tour.jpg?name=</script><script>alert(1)</script>', 'panorama');
  expect(html).not.toContain('name=</script><script>');
  expect(html).toContain('%3C/script%3E');
});
