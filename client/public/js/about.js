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

modeSwitch.innerHTML = currentMode === 'light'
    ? `<img alt="moon-icon" class="w-5" src="/svg/moon.svg"/>`
    : `<img alt="sun-icon" class="w-5" src="/svg/sun.svg"/>`;

modeSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    window.location.href = `?${querySetter(currentLanguage, newMode)}`;
    modeSwitch.innerHTML = currentMode === 'light'
        ? `<img alt="moon-icon" class="w-5" src="/svg/moon.svg"/>`
        : `<img alt="sun-icon" class="w-5" src="/svg/sun.svg"/>`;
})
