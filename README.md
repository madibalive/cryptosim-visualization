# Installing prerequisites
Prerequisites include
 
 *  `cargo`
 *  `wasm-pack`

`cargo` can be installed using `rustup`. Follow the installation instructions on [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install).

Once `cargo` is installed, `wasm-pack` can be installed by running

    $ cargo install wasm-pack

# Building and testing

To build the WASM target and its JS bindings, run

    $ wasm-pack build --target web
    
To run the tests, execute
    
    $ cargo test
