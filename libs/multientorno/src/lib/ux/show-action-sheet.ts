export async function showActionSheet(options: string[]) {
  return new Promise<string>(resolve => {
    const actionSheet = document.createElement('div');
    const selectText = document.createElement('p');

    document.body.appendChild(actionSheet);
    actionSheet.appendChild(selectText);
    selectText.innerText = 'Select an environment';

    document.body.style.cssText = bodyStyles;
    actionSheet.style.cssText = actionSheetStyles;
    selectText.style.cssText = selectTextStyles;
    actionSheet.animate(
      [{ transform: 'translate(-50%, 100%)' }, { transform: 'translate(-50%, 0)' }],
      { duration: 200 }
    );

    const selectOption = (option: string) => {
      resolve(option);
      actionSheet.remove();
      document.body.style.removeProperty('background-color');
      document.body.style.removeProperty('height');
    };

    options.forEach((env: string) => {
      const buttonElement = document.createElement('button');
      buttonElement.innerText = env;
      buttonElement.style.cssText = buttonStyles;
      buttonElement.addEventListener('click', () => selectOption(env));
      actionSheet.appendChild(buttonElement);
    });
  });
}

const bodyStyles = `height: 100%;
    background-color: rgb(165, 165, 165);`;

const actionSheetStyles = `position: fixed;
    display: flex;
    flex-direction: column;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    max-width: 600px;
    width: calc(100% - 40px);
    box-shadow: 3px 3px 10px rgb(132, 132, 132);
    background-color: rgb(240, 240, 240);
    border-radius: 20px;
    padding: 10px 10px 5px 10px;
    box-sizing: border-box;
    text-align: center;
    margin-bottom: 20px;`;

const buttonStyles = `cursor: pointer;
    -webkit-appearance: none;
    border: none;
    border-top: 1px solid rgb(198, 198, 198);
    font-size: 17px;
    color: rgb(75, 113, 235);
    padding: 20px;`;

const selectTextStyles = `
    font-family: Arial, Helvetica, sans-serif;
    color: rgb(165, 165, 165);
    padding-bottom: 10px;`;
