// https://github.com/torch2424/wasm-by-example/blob/master/demo-util/
export const wasmBrowserInstantiate = async (wasmModuleUrl, importObject) => {
  let response = undefined;

  // Check if the browser supports streaming instantiation
  if (WebAssembly.instantiateStreaming) {
    // Fetch the module, and instantiate it as it is downloading
    response = await WebAssembly.instantiateStreaming(
      fetch(wasmModuleUrl),
      importObject
    );
  } else {
    // Fallback to using fetch to download the entire module
    // And then instantiate the module
    const fetchAndInstantiateTask = async () => {
      const wasmArrayBuffer = await fetch(wasmModuleUrl).then(response =>
        response.arrayBuffer()
      );
      return WebAssembly.instantiate(wasmArrayBuffer, importObject);
    };

    response = await fetchAndInstantiateTask();
  }

  return response;
};

let wasmModule;
const go = new Go(); // Defined in wasm_exec.js. Don't forget to add this in your index.html.

const runWasmAdd = async () => {
  // Get the importObject from the go instance.
  const importObject = go.importObject;

  // Instantiate our wasm module
  wasmModule = await wasmBrowserInstantiate("./main.wasm", importObject);

  // Allow the wasm_exec go instance, bootstrap and execute our wasm module
  go.run(wasmModule.instance);

  let total = localStorage.getItem('totals') ?? 0;
  wasmModule.instance.exports.setTotals(total);
  document.getElementById('totals').innerHTML = `€ ${total}`;
};
runWasmAdd();

class Cart extends HTMLElement {
  connectedCallback () {
    this.innerHTML = '<h2>Winkelwagen</h2><p>Totaal: <span id="totals"></span></p>'
  }
}
customElements.define( 'ns-cart', Cart )

class Catalog extends HTMLElement {
  connectedCallback () {
    this.innerHTML = `
      <div class="product">
        <h2>Productnaam</h2>
        <span>€ 10,-</span>
        <a href="#" id="add-to-cart">Add to cart</a>
        <a href="#" id="reset">Reset</a>
      </div>
    `
  }
}
customElements.define( 'ns-catalog', Catalog )     

const button = document.getElementById('add-to-cart');
button.onclick = function click() {
  const addResult = wasmModule.instance.exports.addToCart(10);
  localStorage.setItem('totals', addResult);
  document.getElementById("totals").innerHTML = `€ ${addResult}`;
};

const resetButton = document.getElementById('reset');
resetButton.onclick = function click() {
  const addResult = wasmModule.instance.exports.resetTotals();
  localStorage.setItem('totals', addResult);
  document.getElementById("totals").innerHTML = `€ ${addResult}`;
};