'use strict';
// All values are fictional. No network requests or real-world forecasts are used.
const ratings = {
  '◎': { label: '良好', note: '形のよい波が期待できそう' },
  '○': { label: 'まずまず', note: 'ゆったり楽しめる波' },
  '△': { label: 'いまひとつ', note: '風の影響がありそう' },
  '×': { label: '不向き', note: '波がまとまりにくい想定' }
};
const heights = [.6,.6,.7,.8,.9,1,1.1,1.2,1.2,1.1,1,1.1,1.2,1.3,1.4,1.5,1.5,1.4,1.3,1.2,1.1,1,.9,.8];
const forecast = heights.map((height, hour) => ({
  hour, height, rating: hour < 5 ? '○' : hour < 9 ? '◎' : hour < 12 ? '○' : hour < 17 ? '△' : hour < 21 ? '×' : '△',
  period: hour < 12 ? 8 : 6, direction: hour < 14 ? '南東' : '南',
  wind: hour < 9 ? 2 : hour < 12 ? 3 : hour < 17 ? 5 : hour < 21 ? 7 : 4,
  windDirection: hour < 12 ? '北西' : '南東',
  tide: hour < 4 || hour >= 10 && hour < 16 || hour >= 22 ? '上げ潮' : '下げ潮',
  tideHeight: Math.round(90 + 47 * Math.cos((hour - 4) * Math.PI / 6))
}));
const now = new Date();
document.getElementById('today').textContent = new Intl.DateTimeFormat('ja-JP', {timeZone:'Asia/Tokyo',year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(now) + ' · 日本時間';
const hourly = document.getElementById('hourly');
forecast.forEach(item => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'hour'; button.dataset.hour = item.hour;
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', `${item.hour}時、評価${item.rating} ${ratings[item.rating].label}、波高${item.height.toFixed(1)}メートル`);
  button.innerHTML = `<span class="hour-time">${String(item.hour).padStart(2,'0')}:00</span><span class="hour-rating ${['△','×'].includes(item.rating) ? 'poor' : ''}">${item.rating}</span><span class="bar-area"><span class="bar" style="height:${item.height / 1.5 * 44}px"></span></span><span class="hour-height">${item.height.toFixed(1)}<small> m</small></span><span class="hour-wind">${item.windDirection} ${item.wind}m/s</span>`;
  button.addEventListener('click', () => selectHour(item.hour));
  hourly.append(button);
});
function selectHour(hour) {
  const item = forecast[hour];
  const values = {'selected-time': `${String(hour).padStart(2,'0')}:00 のサンプル予報`, rating: item.rating, 'rating-label':ratings[item.rating].label, 'rating-note':ratings[item.rating].note, height:item.height.toFixed(1), period:`${item.period}秒`, direction:item.direction, wind:item.wind, 'wind-direction':item.windDirection, 'wind-type':hour < 12 ? 'オフショア' : 'オンショア', tide:item.tide, 'tide-height':`${item.tideHeight}cm`};
  Object.entries(values).forEach(([id,value]) => {document.getElementById(id).textContent = value;});
  hourly.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.hour) === hour)));
}
selectHour(9);
// Start at the morning forecast, keeping every hour available by scrolling.
requestAnimationFrame(() => { const selected = hourly.querySelector('[aria-pressed="true"]'); hourly.parentElement.scrollLeft = selected.offsetLeft - hourly.offsetLeft - 150; });
