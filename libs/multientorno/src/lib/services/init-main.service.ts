let selectedEnvironment = '';

function openEnvironmentMenuOptions(jsonPath: string, callbackInit: any) {
  fetch(jsonPath)
    .then(response => response.json())
    .then(jsonOptions => {
      const menu = document.getElementById('menu-env');
      jsonOptions['envOptions'].forEach((env: string) => {
        const buttonElement = document.createElement('button');
        buttonElement.className = 'c-btn-env';
        buttonElement.innerText = `${env}`;
        menu?.appendChild(buttonElement);
      });
    })
    .then(() => bindEnvironmentButtonEvent(callbackInit))
    .catch(() => console.log('ERROR'));
}

function bindEnvironmentButtonEvent(callbackInit: any) {
  const button = Array.from(document.getElementsByClassName('c-btn-env'));
  button.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedEnvironment = btn.innerHTML;
      localStorage.setItem('env', selectedEnvironment);
      (window as any).okcdApplicationEnvironment = selectedEnvironment;
      closeEnvironmentMenuOptions();
      callbackInit(selectedEnvironment);
    });
  });
}

function closeEnvironmentMenuOptions() {
  const menu = document.getElementById('menu-env');
  if (menu) {
    menu.className = 'c-menu--closed';
  }
}

export function initMultiEnvironmentApp(jsonPath: string, callbackInit: any) {
  const environment = (window as any).okcdApplicationEnvironment || localStorage.getItem('env');

  if (environment) {
    localStorage.setItem('env', environment);
    (window as any).okcdApplicationEnvironment = environment;
    callbackInit(environment);
  } else {
    openEnvironmentMenuOptions(jsonPath, callbackInit);
  }
}
