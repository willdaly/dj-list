import noUiSlider from 'nouislider';
import wNumb from 'wnumb';

export function initSlider() {
  const slider = document.querySelector('.slider');
  if (!slider || slider.noUiSlider) {
    return;
  }

  noUiSlider.create(slider, {
    start: [88, 102],
    connect: true,
    range: {
      min: 66,
      max: 193
    },
    format: wNumb({ decimals: 0 })
  });
}

export function getBpmRange() {
  const slider = document.querySelector('.slider');
  if (!slider || !slider.noUiSlider) {
    return [88, 102];
  }

  const values = slider.noUiSlider.get();
  return values.map((value) => parseInt(value, 10));
}
