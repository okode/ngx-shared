let selectedEnvironment = '';

function openEnvironmentMenuOptions(jsonPath: string, initMain: any) {
  fetch(jsonPath)
    .then(response => response.json())
    .then(jsonOptions => {
      const div = document.createElement('div');
      div.className = 'c-menu'
      div.id = 'menu-env'
      document.body.appendChild(div);
      jsonOptions['envOptions'].forEach((env: string) => {
        const buttonElement = document.createElement('button');
        buttonElement.className = 'c-btn-env';
        buttonElement.innerText = `${env}`;
        div.appendChild(buttonElement);
      });
    })
    .then(() => bindEnvironmentButtonEvent(initMain))
    .catch(() => console.log('ERROR'));
}

function bindEnvironmentButtonEvent(initMain: any) {
  const button = Array.from(document.getElementsByClassName('c-btn-env'));
  button.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedEnvironment = btn.innerHTML;
      localStorage.setItem('env', selectedEnvironment);
      (window as any).okcdApplicationEnvironment = selectedEnvironment;
      closeEnvironmentMenuOptions();
      initMain(selectedEnvironment);
    });
  });
}

function closeEnvironmentMenuOptions() {
  const menu = document.getElementById('menu-env');
  if (menu) {
    menu.className = 'c-menu--closed';
  }
}

export function initMultiEnvironmentApp(options: any, initMain: any) {
  const environment = (window as any).okcdApplicationEnvironment || localStorage.getItem('env');

  if (environment) {
    localStorage.setItem('env', environment);
    (window as any).okcdApplicationEnvironment = environment;
    initMain(environment);
  } else {
    openEnvironmentMenuOptions(options.jsonPath, initMain);
  }
}
