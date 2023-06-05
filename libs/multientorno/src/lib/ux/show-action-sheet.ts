export async function showActionSheet(options: string[]) {
  return new Promise<string>(resolve => {
    const actionSheet = document.createElement('div');
    const selectText = document.createElement('p');
    document.body.appendChild(actionSheet);

    document.body.style.cssText = htmlStyles;
    actionSheet.style.cssText = actionSheetStyles;
    selectText.style.cssText =  selectTextStyles;

    selectText.innerText = 'Select an environment';
    actionSheet.appendChild(selectText);

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
      buttonElement.innerText = `${env}`;
      buttonElement.style.cssText = buttonStyles;
      buttonElement.addEventListener('click', () => selectOption(env));
      actionSheet.appendChild(buttonElement);
    });
  });
}

const htmlStyles = `height: 100%;
    background-color: rgb(172, 172, 172);`;

const actionSheetStyles = `position: fixed;
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
    animation: slideUp 0.5s ease-out forwards;
    display: flex;
    text-align: center;
    flex-direction: column;
    margin-bottom: 20px;
    margin-right: 20px;`;

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



// .c-env-button:hover {
//       color: rgb(24, 61, 185);
// }
