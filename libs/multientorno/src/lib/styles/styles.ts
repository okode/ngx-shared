export function addStyles(e: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
    Object.entries(styles).forEach(([property, value]) => {
      (e.style as any)[property] = value;
    });
}

export const buttonStyles = {
  backgroundColor: 'white',
  appearance: 'none',
  borderRadius: '15px',
  border: '1px solid rgb(189, 189, 189)',
  padding: '20px',
  margin: '5px',
  cursor: 'pointer',
  hover: {
    boxshadow: '5px 2px 2px rgb(227, 227, 227)'
  }
};

export const divStyles = {
  display: 'flex',
  flexDirection: 'column',
};
