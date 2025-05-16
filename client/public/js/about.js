const languageSwitch = document.querySelector('#language-switch');
const modeSwitch = document.querySelector('#mode-switch');
const body = document.getElementsByTagName('body')[0];

const urlParams = new URLSearchParams(window.location.search);
const currentLanguage = urlParams.get('lang') || 'en';
const currentMode = urlParams.get('mode') || 'light';
body.classList.add(currentMode);
body.classList.add(currentLanguage);

function querySetter(language, mode) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('lang', language);
    urlParams.set('mode', mode);
    return urlParams.toString();
}
querySetter(currentLanguage, currentMode);

modeSwitch.innerText = currentMode === 'light' ? '🌙' : '☀️';
languageSwitch.innerText = currentLanguage === 'en' ? '中文' : 'English';

languageSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    const newLanguage = currentLanguage === 'en' ? 'zh' : 'en';
    window.location.href = `?${querySetter(newLanguage, currentMode)}`;
    languageSwitch.innerText = newLanguage === 'en' ? '中文' : 'English';
})
modeSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    window.location.href = `?${querySetter(currentLanguage, newMode)}`;
    modeSwitch.innerText = newMode === 'light' ? '🌙' : '☀️';
})
