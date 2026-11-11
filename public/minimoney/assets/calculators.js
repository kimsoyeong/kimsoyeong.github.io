const form = document.querySelector('form[data-calculator]');
const format = new Intl.NumberFormat(document.documentElement.lang, {
  style: 'currency',
  currency: 'KRW',
});
const isKorean = document.documentElement.lang === 'ko';

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = form.querySelector('output');
  const details = form.querySelector('.result small');

  if (form.dataset.calculator === 'budget') {
    const remaining = form.elements.budget.valueAsNumber
      + form.elements.income.valueAsNumber
      - form.elements.spending.valueAsNumber;
    result.textContent = format.format(remaining);
    details.textContent = remaining < 0
      ? (isKorean ? '설정한 예산을 초과했어요.' : 'You are over your budget.')
      : '';
    return;
  }

  const total = form.elements.total.valueAsNumber;
  const months = form.elements.months.valueAsNumber;
  const monthlyAmount = Math.floor(total / months);
  const remainder = total % months;
  const firstAmount = monthlyAmount + remainder;
  result.textContent = isKorean
    ? `첫 달 ${format.format(firstAmount)}`
    : `First month: ${format.format(firstAmount)}`;
  details.textContent = months === 1 ? '' : isKorean
    ? `이후 ${months - 1}개월은 매달 ${format.format(monthlyAmount)}`
    : `Then ${format.format(monthlyAmount)} per month for ${months - 1} month(s).`;
});
