import noUiSlider from 'nouislider';
import wNumb from 'wnumb';

function setRangeLabel(values) {
  const label = document.getElementById('bpmRangeDisplay');
  if (!label || !Array.isArray(values) || values.length < 2) {
    return;
  }
  label.textContent = `Range: ${values[0]} - ${values[1]}`;
}

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

  setRangeLabel(getBpmRange());
  slider.noUiSlider.on('update', () => {
    setRangeLabel(getBpmRange());
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
