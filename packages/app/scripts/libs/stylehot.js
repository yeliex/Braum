window.onmessage = function styleHot({ data }) {
  if (typeof data === 'string' && data.match(/^webpackHotUpdate/)) {
    console.log('[HSR] Updating Styles.');
    setTimeout(() => {
      const styles = window.document.getElementsByTagName('link');
      Array.prototype.slice.call(styles).forEach((element) => {
        const href = element.href;
        element.href = href;
        console.log(`[HSR]${href}`);
      }, 500);
      console.log('[HSR] Update Styles Finished.');
    });
  }
};
